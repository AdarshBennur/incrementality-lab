import { normalInv } from "../experimentation/engine";

export interface SampleSizeInput {
  baseline: number; // 0..1
  mde: number; // relative lift, e.g. 0.05 = 5%
  confidence: number; // e.g. 0.95
  power: number; // e.g. 0.8
  splitTreat: number; // 0..1 fraction assigned to treatment
}

export function requiredSampleSize({
  baseline,
  mde,
  confidence,
  power,
  splitTreat,
}: SampleSizeInput) {
  const p1 = baseline;
  const p2 = baseline * (1 + mde);

  const zA = normalInv(1 - (1 - confidence) / 2);
  const zB = normalInv(power);

  const pBar = (p1 + p2) / 2;
  const num = zA * Math.sqrt(2 * pBar * (1 - pBar)) + zB * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));

  const nPerGroup = Math.ceil((num * num) / Math.pow(p2 - p1, 2));

  // Adjust for unequal split
  const k = splitTreat / (1 - splitTreat);
  const nCtrl = Math.ceil((nPerGroup * (1 + 1 / k)) / 2);
  const nTreat = Math.ceil(nCtrl * k);

  return { nTreat, nCtrl, total: nTreat + nCtrl };
}
