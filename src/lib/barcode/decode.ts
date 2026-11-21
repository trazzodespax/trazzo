import { parseGs1, toKg, type WeightUom } from "../gs1/parse";
import type { BarcodeProfile, DecodedBarcode } from "./types";

// ---------- Normalización de formatos (BarcodeDetector y ZXing usan nombres distintos) ----------
const FORMAT_MAP: Record<string, string> = {
  code128: "code_128", code39: "code_39", code93: "code_93",
  qrcode: "qr_code", ean13: "ean_13", ean8: "ean_8",
  upca: "upc_a", upce: "upc_e", itf: "itf",
  datamatrix: "data_matrix", pdf417: "pdf417", aztec: "aztec", codabar: "codabar",
};

export function normalizeFormat(format?: string | null): string | null {
  if (!format) return null;
  const key = format.toLowerCase().replace(/[^a-z0-9]/g, "");
  return FORMAT_MAP[key] ?? key;
}

// ---------- Tipos de configuración por estrategia ----------
type DateFormat = "YYMMDD" | "YYYYMMDD";
interface FieldPos { start: number; length: number } // start es base 1 (como lo cuentas en la hoja)

interface FixedConfig {
  minLength?: number;
  weight: FieldPos & { decimals?: number; uom: WeightUom };
  gtin?: FieldPos;
  lot?: FieldPos;
  serial?: FieldPos;
  production?: FieldPos & { format?: DateFormat };
  expiry?: FieldPos & { format?: DateFormat };
}

interface RegexConfig {
  pattern: string;          // grupos con nombre: weight, lot, serial, gtin, production, expiry
  flags?: string;
  uom: WeightUom;
  decimals?: number;
  dateFormat?: DateFormat;
}

interface JsonConfig {
  weightKey: string;
  uom: WeightUom;
  lotKey?: string;
  serialKey?: string;
  gtinKey?: string;
  productionKey?: string;
  expiryKey?: string;
  dateFormat?: DateFormat;
}

interface Fields {
  gtin?: string | null;
  lot?: string | null;
  serial?: string | null;
  productionDate?: string | null;
  expiryDate?: string | null;
  weight?: { value: number; uom: WeightUom } | null;
  extra?: Record<string, unknown>;
  errors?: string[];
}

// ---------- Utilidades ----------
function toIsoDate(v: string | null | undefined, format: DateFormat = "YYMMDD"): string | null {
  if (!v) return null;
  const re = format === "YYYYMMDD" ? /^(\d{4})(\d{2})(\d{2})$/ : /^(\d{2})(\d{2})(\d{2})$/;
  const m = re.exec(v);
  if (!m) return null;
  const year = format === "YYYYMMDD" ? Number(m[1]) : 2000 + Number(m[1]);
  const month = Number(m[2]);
  let day = Number(m[3]);
  if (month < 1 || month > 12) return null;
  if (day === 0) day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function cut(raw: string, pos: FieldPos): string | null {
  const from = pos.start - 1;
  const value = raw.slice(from, from + pos.length);
  return value.length === pos.length ? value : null;
}

// ---------- Estrategias ----------
function byGs1(raw: string): Fields | null {
  const r = parseGs1(raw);
  if (Object.keys(r.ais).length === 0) return null;
  return {
    gtin: r.gtin,
    lot: r.lot,
    serial: r.serial,
    productionDate: r.productionDate,
    expiryDate: r.expiryDate,
    weight: r.weight ? { value: r.weight.value, uom: r.weight.uom } : null,
    extra: { ais: r.ais },
    errors: r.errors,
  };
}

function byFixedPosition(raw: string, cfg: FixedConfig): Fields | null {
  if (cfg.minLength && raw.length < cfg.minLength) return null;
  const weightText = cut(raw, cfg.weight);
  if (!weightText || !/^\d+$/.test(weightText)) return null;
  const value = Number(weightText) / 10 ** (cfg.weight.decimals ?? 0);
  return {
    gtin: cfg.gtin ? cut(raw, cfg.gtin) : null,
    lot: cfg.lot ? cut(raw, cfg.lot) : null,
    serial: cfg.serial ? cut(raw, cfg.serial) : null,
    productionDate: cfg.production ? toIsoDate(cut(raw, cfg.production), cfg.production.format) : null,
    expiryDate: cfg.expiry ? toIsoDate(cut(raw, cfg.expiry), cfg.expiry.format) : null,
    weight: { value, uom: cfg.weight.uom },
  };
}

function byRegex(raw: string, cfg: RegexConfig): Fields | null {
  if (raw.length > 512) return null;
  const match = new RegExp(cfg.pattern, cfg.flags ?? "").exec(raw);
  if (!match || !match.groups) return null;
  const g = match.groups;
  const weightText = g.weight?.replace(",", ".");
  const value = weightText ? Number(weightText) / 10 ** (cfg.decimals ?? 0) : NaN;
  return {
    gtin: g.gtin ?? null,
    lot: g.lot ?? null,
    serial: g.serial ?? null,
    productionDate: toIsoDate(g.production, cfg.dateFormat),
    expiryDate: toIsoDate(g.expiry, cfg.dateFormat),
    weight: Number.isFinite(value) ? { value, uom: cfg.uom } : null,
  };
}

function byJson(raw: string, cfg: JsonConfig): Fields | null {
  if (!raw.startsWith("{")) return null;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  const text = (key?: string) =>
    key && obj[key] !== undefined && obj[key] !== null ? String(obj[key]) : null;
  const weightText = text(cfg.weightKey)?.replace(",", ".");
  const value = weightText ? Number(weightText) : NaN;
  return {
    gtin: text(cfg.gtinKey),
    lot: text(cfg.lotKey),
    serial: text(cfg.serialKey),
    productionDate: toIsoDate(text(cfg.productionKey), cfg.dateFormat),
    expiryDate: toIsoDate(text(cfg.expiryKey), cfg.dateFormat),
    weight: Number.isFinite(value) ? { value, uom: cfg.uom } : null,
    extra: { json: obj },
  };
}

function byGtinOnly(raw: string): Fields | null {
  return /^(\d{8}|\d{12,14})$/.test(raw) ? { gtin: raw } : null;
}

function run(profile: BarcodeProfile, raw: string): Fields | null {
  switch (profile.strategy) {
    case "GS1":
      return byGs1(raw);
    case "FIXED_POSITION":
      return byFixedPosition(raw, profile.config as unknown as FixedConfig);
    case "REGEX":
      return byRegex(raw, profile.config as unknown as RegexConfig);
    case "JSON":
      return byJson(raw, profile.config as unknown as JsonConfig);
    case "GTIN_ONLY":
      return byGtinOnly(raw);
    default:
      return null;
  }
}

// Perfiles por defecto si la base no devuelve ninguno
export const DEFAULT_PROFILES: BarcodeProfile[] = [
  { code: "GS1_AUTO", strategy: "GS1", symbologies: [], config: {}, priority: 10 },
  { code: "GTIN_ONLY_AUTO", strategy: "GTIN_ONLY", symbologies: [], config: {}, priority: 900 },
];

// ---------- Función principal ----------
export function decodeBarcode(
  rawInput: string,
  format: string | null,
  profiles: BarcodeProfile[] = DEFAULT_PROFILES
): DecodedBarcode {
  const raw = rawInput.trim();
  const fmt = normalizeFormat(format);

  const out: DecodedBarcode = {
    raw, format: fmt, strategy: "MANUAL", profileCode: null,
    gtin: null, lot: null, serial: null, productionDate: null, expiryDate: null,
    weight: null, weightKg: null, needsManualWeight: true,
    extra: {}, errors: [],
  };

  if (!raw) {
    out.errors.push("Lectura vacía");
    return out;
  }

  const ordered = [...profiles].sort((a, b) => a.priority - b.priority);

  for (const profile of ordered) {
    if (profile.symbologies.length > 0 && fmt && !profile.symbologies.includes(fmt)) continue;
    if (profile.strategy === "MANUAL") break; // este producto siempre captura el peso a mano

    let fields: Fields | null = null;
    try {
      fields = run(profile, raw);
    } catch (e) {
      out.errors.push(`Perfil ${profile.code}: ${(e as Error).message}`);
      continue;
    }
    if (!fields) continue;

    // Conserva datos de identificación aunque este perfil no aporte peso
    out.gtin = fields.gtin ?? out.gtin;
    out.lot = fields.lot ?? out.lot;
    out.serial = fields.serial ?? out.serial;
    out.productionDate = fields.productionDate ?? out.productionDate;
    out.expiryDate = fields.expiryDate ?? out.expiryDate;
    if (fields.errors) out.errors.push(...fields.errors);

    const w = fields.weight;
    if (w && Number.isFinite(w.value) && w.value > 0) {
      out.strategy = profile.strategy;
      out.profileCode = profile.code;
      out.weight = w;
      out.weightKg = toKg(w.value, w.uom);
      out.needsManualWeight = false;
      out.extra = fields.extra ?? {};
      return out;
    }
  }

  return out; // sin peso: la pantalla pedirá captura manual
}