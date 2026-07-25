// Lightweight statistical utilities for two-proportion z-test and power/sample-size.
// Deterministic, no dependencies. Real engine can replace these later.

export function normalCdf(z: number): number {
  // Abramowitz & Stegun approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

export function normalInv(p: number): number {
  // Beasley-Springer-Moro
  const a = [
    -39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472,
    2.50662827745924,
  ];
  const b = [
    -54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857,
  ];
  const c = [
    -0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373,
    4.37466414146497, 2.93816398269878,
  ];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const pl = 0.02425,
    pu = 1 - pl;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pu) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

export interface TwoPropResult {
  pTreat: number;
  pCtrl: number;
  absLift: number;
  relLift: number;
  z: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  significant: boolean;
  confidence: number;
}

export function twoProportionTest(
  convTreat: number,
  nTreat: number,
  convCtrl: number,
  nCtrl: number,
  confidence = 0.95,
): TwoPropResult {
  const pTreat = convTreat / nTreat;
  const pCtrl = convCtrl / nCtrl;
  const absLift = pTreat - pCtrl;
  const relLift = pCtrl > 0 ? absLift / pCtrl : 0;
  const pPool = (convTreat + convCtrl) / (nTreat + nCtrl);
  const sePool = Math.sqrt(pPool * (1 - pPool) * (1 / nTreat + 1 / nCtrl));
  const z = sePool > 0 ? absLift / sePool : 0;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  const seDiff = Math.sqrt((pTreat * (1 - pTreat)) / nTreat + (pCtrl * (1 - pCtrl)) / nCtrl);
  const zCrit = normalInv(1 - (1 - confidence) / 2);
  return {
    pTreat,
    pCtrl,
    absLift,
    relLift,
    z,
    pValue,
    ciLow: absLift - zCrit * seDiff,
    ciHigh: absLift + zCrit * seDiff,
    significant: pValue < 1 - confidence,
    confidence,
  };
}

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
