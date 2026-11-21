import type { WeightUom } from "../gs1/parse";

export type Strategy =
  | "GS1"
  | "FIXED_POSITION"
  | "REGEX"
  | "JSON"
  | "GTIN_ONLY"
  | "MANUAL";

export interface BarcodeProfile {
  code: string;
  strategy: Strategy;
  symbologies: string[];               // vacío = cualquier formato
  config: Record<string, unknown>;
  priority: number;                    // menor = se prueba primero
  productId?: string | null;
  supplierId?: string | null;
}

export interface DecodedBarcode {
  raw: string;
  format: string | null;               // formato normalizado: code_128, qr_code...
  strategy: Strategy;                  // "MANUAL" si ningún perfil obtuvo peso
  profileCode: string | null;
  gtin: string | null;
  lot: string | null;
  serial: string | null;
  productionDate: string | null;       // YYYY-MM-DD
  expiryDate: string | null;           // YYYY-MM-DD
  weight: { value: number; uom: WeightUom } | null;
  weightKg: number | null;
  needsManualWeight: boolean;
  extra: Record<string, unknown>;
  errors: string[];
}