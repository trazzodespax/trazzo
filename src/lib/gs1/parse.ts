// src/lib/gs1/parse.tsx

// Parser GS1-128: lee los Application Identifiers (AI) en lugar de posiciones fijas.
// Soporta: prefijo de simbología (]C1), separadores FNC1 (carácter GS, \x1d)
// y el formato con paréntesis "(01)...(17)...".

export type WeightUom = "KG" | "LB";

export interface Gs1Result {
  raw: string;
  ais: Record<string, string>;
  gtin: string | null;
  lot: string | null;
  serial: string | null;
  expiryDate: string | null;      // YYYY-MM-DD
  productionDate: string | null;  // YYYY-MM-DD
  weight: { value: number; uom: WeightUom; ai: string } | null;
  errors: string[];
}

const GS = "\x1d";
const LB_TO_KG = 0.45359237;

// AIs de longitud fija (dígitos del valor, sin contar el AI)
const FIXED: Record<string, number> = {
  "00": 18, "01": 14, "02": 14,
  "11": 6, "13": 6, "15": 6, "16": 6, "17": 6,
};
// AIs de longitud variable (máximo)
const VARIABLE_MAX: Record<string, number> = {
  "10": 20, "21": 20, "30": 8, "37": 8,
};

type AiSpec =
  | { code: string; fixed: true; length: number }
  | { code: string; fixed: false; max: number };

function detectAi(s: string, pos: number): AiSpec | null {
  // Peso neto: 310n (kg) y 320n (lb); la n indica los decimales
  const four = s.slice(pos, pos + 4);
  if (/^(310|320)\d$/.test(four)) return { code: four, fixed: true, length: 6 };

  const two = s.slice(pos, pos + 2);
  if (two in FIXED) return { code: two, fixed: true, length: FIXED[two] };
  if (two in VARIABLE_MAX) return { code: two, fixed: false, max: VARIABLE_MAX[two] };
  return null;
}

function yymmddToIso(v: string | undefined): string | null {
  if (!v || !/^\d{6}$/.test(v)) return null;
  const yy = Number(v.slice(0, 2));
  const mm = Number(v.slice(2, 4));
  let dd = Number(v.slice(4, 6));
  if (mm < 1 || mm > 12) return null;
  const year = 2000 + yy;
  if (dd === 0) dd = new Date(Date.UTC(year, mm, 0)).getUTCDate(); // 00 = último día del mes
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function parseGs1(input: string): Gs1Result {
  const result: Gs1Result = {
    raw: input, ais: {}, gtin: null, lot: null, serial: null,
    expiryDate: null, productionDate: null, weight: null, errors: [],
  };

  let s = input.trim();
  s = s.replace(/^\][A-Za-z]\d/, ""); // identificador de simbología, p. ej. ]C1
  if (s.includes("(")) {
    // "(01)123(17)261231" -> "01123" + GS + "17261231"
    s = s.replace(/\((\d{2,4})\)/g, (_m, ai) => GS + ai).replace(/^\x1d/, "");
  }

  let pos = 0;
  while (pos < s.length) {
    if (s[pos] === GS) { pos++; continue; }

    const ai = detectAi(s, pos);
    if (!ai) {
      result.errors.push(`AI desconocido en la posición ${pos + 1}`);
      break;
    }
    pos += ai.code.length;

    let value: string;
    if (ai.fixed) {
      value = s.slice(pos, pos + ai.length);
      if (value.length < ai.length) {
        result.errors.push(`AI ${ai.code} incompleto`);
        break;
      }
      pos += ai.length;
    } else {
      let end = s.indexOf(GS, pos);
      if (end === -1) end = s.length;
      value = s.slice(pos, Math.min(end, pos + ai.max));
      pos += value.length;
    }
    result.ais[ai.code] = value;
  }

  const { ais } = result;
  result.gtin = ais["01"] ?? null;
  result.lot = ais["10"] ?? null;
  result.serial = ais["21"] ?? null;
  result.expiryDate = yymmddToIso(ais["17"] ?? ais["15"]);
  result.productionDate = yymmddToIso(ais["11"]);

  const weightKey = Object.keys(ais).find((k) => /^(310|320)\d$/.test(k));
  if (weightKey) {
    const decimals = Number(weightKey[3]);
    result.weight = {
      value: Number(ais[weightKey]) / 10 ** decimals,
      uom: weightKey.startsWith("310") ? "KG" : "LB",
      ai: weightKey,
    };
  }
  return result;
}

// Conversión con el factor exacto, a 3 decimales (misma que usa la base de datos)
export function toKg(value: number, uom: WeightUom): number {
  const kg = uom === "LB" ? value * LB_TO_KG : value;
  return Math.round(kg * 1000) / 1000;
}