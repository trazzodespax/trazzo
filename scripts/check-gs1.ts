// scripts/check-gs1.ts

import { parseGs1, toKg } from "../src/lib/gs1/parse";

// Código de EJEMPLO de 44 caracteres (inventado por mí; reemplázalo por uno real tuyo)
const sample = "0100012345678905" + "17261231" + "3202005508" + "10L2611001";

const r = parseGs1(sample);
console.log(r);
if (r.weight) {
  console.log("kg:", toKg(r.weight.value, r.weight.uom));
}