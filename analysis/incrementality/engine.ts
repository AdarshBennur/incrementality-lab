import { TwoPropResult } from "../experimentation/engine";

export interface IncrementalityResult {
  incrementalConv: number;
  baselineConv: number;
  incrementalRevenue: number;
  baselineRevenue: number;
  attributedRevenue: number;
  incrementalityPct: number;
  traditionalRoas: number;
  incrementalRoas: number;
  traditionalCac: number;
  incrementalCac: number;
  costPerIncrementalConv: number;
  decision: "SCALE" | "MAINTAIN" | "ITERATE" | "STOP";
}

export function calculateIncrementality(
  test: TwoPropResult,
  nTreat: number,
  convTreat: number,
  revTreat: number,
  spend: number,
  avgOrderValue: number,
): IncrementalityResult {
  // Expected baseline: what would have happened to the treatment group without the campaign
  const baselineConv = test.pCtrl * nTreat;
  const incrementalConv = convTreat - baselineConv;

  const baselineRevenue = baselineConv * avgOrderValue;
  const attributedRevenue = revTreat;
  const incrementalRevenue = attributedRevenue - baselineRevenue;

  const incrementalityPct = attributedRevenue > 0 ? incrementalRevenue / attributedRevenue : 0;

  const traditionalRoas = spend > 0 ? attributedRevenue / spend : 0;
  const incrementalRoas = spend > 0 ? incrementalRevenue / spend : 0;

  const traditionalCac = convTreat > 0 ? spend / convTreat : 0;
  const incrementalCac = incrementalConv > 0 ? spend / incrementalConv : 0;

  let decision: "SCALE" | "MAINTAIN" | "ITERATE" | "STOP" = "ITERATE";
  if (test.significant && incrementalRoas >= 2) decision = "SCALE";
  else if (test.significant && incrementalRoas >= 1) decision = "MAINTAIN";
  else if (!test.significant && Math.abs(test.relLift) < 0.02) decision = "ITERATE";
  else if (incrementalRoas < 0.5) decision = "STOP";

  return {
    incrementalConv,
    baselineConv,
    incrementalRevenue,
    baselineRevenue,
    attributedRevenue,
    incrementalityPct,
    traditionalRoas,
    incrementalRoas,
    traditionalCac,
    incrementalCac,
    costPerIncrementalConv: incrementalCac,
    decision,
  };
}
