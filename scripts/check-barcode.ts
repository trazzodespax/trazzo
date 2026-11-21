import { decodeBarcode, DEFAULT_PROFILES } from "../src/lib/barcode/decode";
import type { BarcodeProfile } from "../src/lib/barcode/types";

const profiles: BarcodeProfile[] = [
  ...DEFAULT_PROFILES,
  {
    code: "LEGACY_44", strategy: "FIXED_POSITION", symbologies: ["code_128"], priority: 20,
    config: { minLength: 34, weight: { start: 29, length: 6, decimals: 2, uom: "LB" } },
  },
  {
    code: "CODE39_DEMO", strategy: "REGEX", symbologies: ["code_39"], priority: 30,
    config: { pattern: "^(?<lot>[A-Z0-9]+)-(?<weight>\\d+\\.\\d+)KG$", uom: "KG" },
  },
  {
    code: "QR_JSON_DEMO", strategy: "JSON", symbologies: ["qr_code"], priority: 40,
    config: { weightKey: "peso", uom: "KG", lotKey: "lote" },
  },
];

const cases: Array<[string, string, string]> = [
  // Lectura REAL de la etiqueta de pulpa de cerdo
  ["Pulpa de cerdo (REAL)", "code_128", "01900287491703061126100732020055802124268176"],
  // Los demás son ejemplos inventados
  ["Legacy 44 (no GS1)", "Code128", "99" + "0".repeat(26) + "005508" + "LOT0000001"],
  ["Code 39", "code_39", "LOTE2611-25.40KG"],
  ["QR con JSON", "qr_code", '{"lote":"L1","peso":24.98}'],
  ["EAN-13 (solo GTIN)", "ean_13", "7501234567895"],
  ["Segundo código de la etiqueta", "code_128", "28026FVU07"],
];

for (const [label, format, raw] of cases) {
  const r = decodeBarcode(raw, format, profiles);
  console.log(label, "->", {
    perfil: r.profileCode,
    peso: r.weight,
    kg: r.weightKg,
    gtin: r.gtin,
    serie: r.serial,
    produccion: r.productionDate,
    lote: r.lot,
    pesoManual: r.needsManualWeight,
  });
}