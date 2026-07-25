// Centralized demo-data layer. Everything the UI shows derives from these
// primitives + the stats utilities. Replace the primitives with a real dataset
// later — component contracts remain the same.

import { twoProportionTest } from "./stats";

export interface ExperimentPrimitives {
  id: string;
  name: string;
  campaign: string;
  channel: string;
  status: "Running" | "Completed" | "Paused";
  startDate: string;
  endDate: string;
  primaryKpi: string;
  // Aggregate counts
  nTreat: number;
  nCtrl: number;
  convTreat: number;
  convCtrl: number;
  revTreat: number;
  revCtrl: number;
  spend: number;
  avgOrderValue: number;
  // Time series (daily)
  daily: Array<{
    day: number;
    date: string;
    cvrTreat: number;
    cvrCtrl: number;
    cumConvTreat: number;
    cumConvCtrl: number;
  }>;
  // Segments
  segments: SegmentPrimitives[];
}

export interface SegmentPrimitives {
  dimension: "Device" | "Geography" | "Audience Segment" | "Customer Type" | "Daypart";
  name: string;
  nTreat: number;
  nCtrl: number;
  convTreat: number;
  convCtrl: number;
  revenuePerConv: number;
}

export const EXPERIMENTS: ExperimentPrimitives[] = [
  {
    id: "exp-holiday-24",
    name: "Holiday Prospecting — Video Uplift",
    campaign: "Q4 Holiday Prospecting",
    channel: "Meta + YouTube",
    status: "Completed",
    startDate: "2025-10-14",
    endDate: "2025-11-11",
    primaryKpi: "Purchase Conversion Rate",
    nTreat: 184_320,
    nCtrl: 61_450,
    convTreat: 5_842,
    convCtrl: 1_684,
    revTreat: 742_530,
    revCtrl: 214_060,
    spend: 186_400,
    avgOrderValue: 127,
    daily: buildDaily(29, 0.0295, 0.0272, 184_320, 61_450, 42),
    segments: [
      { dimension: "Device", name: "Mobile", nTreat: 121_500, nCtrl: 40_500, convTreat: 4_012, convCtrl: 1_053, revenuePerConv: 118 },
      { dimension: "Device", name: "Desktop", nTreat: 51_400, nCtrl: 17_150, convTreat: 1_496, convCtrl: 490, revenuePerConv: 148 },
      { dimension: "Device", name: "Tablet", nTreat: 11_420, nCtrl: 3_800, convTreat: 334, convCtrl: 141, revenuePerConv: 132 },
      { dimension: "Geography", name: "North America", nTreat: 92_100, nCtrl: 30_700, convTreat: 3_078, convCtrl: 892, revenuePerConv: 134 },
      { dimension: "Geography", name: "EMEA", nTreat: 58_240, nCtrl: 19_400, convTreat: 1_712, convCtrl: 517, revenuePerConv: 121 },
      { dimension: "Geography", name: "APAC", nTreat: 33_980, nCtrl: 11_350, convTreat: 1_052, convCtrl: 275, revenuePerConv: 116 },
      { dimension: "Audience Segment", name: "New Visitors", nTreat: 108_900, nCtrl: 36_300, convTreat: 2_648, convCtrl: 782, revenuePerConv: 112 },
      { dimension: "Audience Segment", name: "Returning", nTreat: 54_780, nCtrl: 18_260, convTreat: 2_361, convCtrl: 668, revenuePerConv: 138 },
      { dimension: "Audience Segment", name: "Lookalike 1%", nTreat: 20_640, nCtrl: 6_890, convTreat: 833, convCtrl: 234, revenuePerConv: 141 },
      { dimension: "Customer Type", name: "First-Time Buyers", nTreat: 143_800, nCtrl: 47_920, convTreat: 3_924, convCtrl: 1_182, revenuePerConv: 108 },
      { dimension: "Customer Type", name: "Repeat Customers", nTreat: 40_520, nCtrl: 13_530, convTreat: 1_918, convCtrl: 502, revenuePerConv: 156 },
      { dimension: "Daypart", name: "Morning (6a–12p)", nTreat: 48_200, nCtrl: 16_100, convTreat: 1_402, convCtrl: 425, revenuePerConv: 121 },
      { dimension: "Daypart", name: "Afternoon (12–6p)", nTreat: 62_500, nCtrl: 20_800, convTreat: 1_988, convCtrl: 561, revenuePerConv: 128 },
      { dimension: "Daypart", name: "Evening (6p–12a)", nTreat: 58_400, nCtrl: 19_450, convTreat: 1_997, convCtrl: 552, revenuePerConv: 134 },
      { dimension: "Daypart", name: "Late night (12–6a)", nTreat: 15_220, nCtrl: 5_100, convTreat: 455, convCtrl: 146, revenuePerConv: 108 },
    ],
  },
  {
    id: "exp-brand-search",
    name: "Brand Search Suppression Test",
    campaign: "Brand Search — Non-Brand Uplift",
    channel: "Google Search",
    status: "Completed",
    startDate: "2025-09-01",
    endDate: "2025-09-21",
    primaryKpi: "Signup Conversion Rate",
    nTreat: 96_400,
    nCtrl: 96_800,
    convTreat: 3_182,
    convCtrl: 3_098,
    revTreat: 318_200,
    revCtrl: 309_800,
    spend: 42_800,
    avgOrderValue: 100,
    daily: buildDaily(20, 0.0330, 0.0320, 96_400, 96_800, 91),
    segments: [
      { dimension: "Device", name: "Mobile", nTreat: 62_500, nCtrl: 62_800, convTreat: 2_012, convCtrl: 1_968, revenuePerConv: 96 },
      { dimension: "Device", name: "Desktop", nTreat: 33_900, nCtrl: 34_000, convTreat: 1_170, convCtrl: 1_130, revenuePerConv: 108 },
      { dimension: "Geography", name: "North America", nTreat: 58_100, nCtrl: 58_200, convTreat: 1_920, convCtrl: 1_866, revenuePerConv: 102 },
      { dimension: "Geography", name: "EMEA", nTreat: 26_400, nCtrl: 26_500, convTreat: 856, convCtrl: 838, revenuePerConv: 97 },
      { dimension: "Geography", name: "APAC", nTreat: 11_900, nCtrl: 12_100, convTreat: 406, convCtrl: 394, revenuePerConv: 92 },
      { dimension: "Customer Type", name: "First-Time Buyers", nTreat: 61_000, nCtrl: 61_200, convTreat: 1_842, convCtrl: 1_810, revenuePerConv: 88 },
      { dimension: "Customer Type", name: "Repeat Customers", nTreat: 35_400, nCtrl: 35_600, convTreat: 1_340, convCtrl: 1_288, revenuePerConv: 116 },
    ],
  },
];

function buildDaily(days: number, cvrT: number, cvrC: number, nTreat: number, nCtrl: number, seed: number) {
  const start = new Date("2025-10-14T00:00:00Z");
  const perDayT = nTreat / days;
  const perDayC = nCtrl / days;
  let cumT = 0, cumC = 0;
  const rows = [];
  // deterministic wobble
  const rand = (i: number) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 233280;
    return x - Math.floor(x);
  };
  for (let i = 0; i < days; i++) {
    const wobbleT = (rand(i) - 0.5) * 0.004;
    const wobbleC = (rand(i + 100) - 0.5) * 0.004;
    const dT = cvrT + wobbleT;
    const dC = cvrC + wobbleC;
    cumT += dT * perDayT;
    cumC += dC * perDayC;
    const d = new Date(start.getTime() + i * 86400000);
    rows.push({
      day: i + 1,
      date: d.toISOString().slice(0, 10),
      cvrTreat: dT,
      cvrCtrl: dC,
      cumConvTreat: cumT,
      cumConvCtrl: cumC,
    });
  }
  return rows;
}

// Derived analytics --------------------------------------------------

export interface ExperimentAnalytics {
  primitives: ExperimentPrimitives;
  test: ReturnType<typeof twoProportionTest>;
  durationDays: number;
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

export function analyze(p: ExperimentPrimitives): ExperimentAnalytics {
  const test = twoProportionTest(p.convTreat, p.nTreat, p.convCtrl, p.nCtrl);
  const durationDays = Math.round(
    (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 86400000
  ) + 1;
  // Expected baseline: treatment population × control CVR
  const baselineConv = test.pCtrl * p.nTreat;
  const incrementalConv = p.convTreat - baselineConv;
  const baselineRevenue = baselineConv * p.avgOrderValue;
  const attributedRevenue = p.revTreat;
  const incrementalRevenue = attributedRevenue - baselineRevenue;
  const incrementalityPct = attributedRevenue > 0 ? incrementalRevenue / attributedRevenue : 0;
  const traditionalRoas = p.spend > 0 ? attributedRevenue / p.spend : 0;
  const incrementalRoas = p.spend > 0 ? incrementalRevenue / p.spend : 0;
  const traditionalCac = p.convTreat > 0 ? p.spend / p.convTreat : 0;
  const incrementalCac = incrementalConv > 0 ? p.spend / incrementalConv : 0;
  const costPerIncrementalConv = incrementalCac;

  let decision: ExperimentAnalytics["decision"] = "ITERATE";
  if (test.significant && incrementalRoas >= 2) decision = "SCALE";
  else if (test.significant && incrementalRoas >= 1) decision = "MAINTAIN";
  else if (!test.significant && Math.abs(test.relLift) < 0.02) decision = "ITERATE";
  else if (incrementalRoas < 0.5) decision = "STOP";

  return {
    primitives: p,
    test,
    durationDays,
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
    costPerIncrementalConv,
    decision,
  };
}

export function analyzeSegment(s: SegmentPrimitives) {
  const test = twoProportionTest(s.convTreat, s.nTreat, s.convCtrl, s.nCtrl);
  const baseline = test.pCtrl * s.nTreat;
  const incrementalConv = s.convTreat - baseline;
  const incrementalRevenue = incrementalConv * s.revenuePerConv;
  return { segment: s, test, incrementalConv, incrementalRevenue };
}

export const GLOSSARY: Record<string, string> = {
  "Treatment Group": "The audience exposed to the campaign. Their behavior is what we measure.",
  "Control Group": "A randomized holdout audience not shown the campaign. Their behavior tells us what would have happened anyway.",
  "Absolute Lift": "Treatment conversion rate minus control conversion rate, expressed in percentage points.",
  "Relative Lift": "The absolute lift divided by the control conversion rate. Answers: how much better did treatment perform, in %.",
  "Incrementality": "The share of observed outcomes that would not have occurred without the campaign.",
  "P-value": "The probability of seeing a difference this large (or larger) purely by chance if the campaign had no effect. Lower is stronger evidence.",
  "Confidence Interval": "The range that likely contains the true lift. A narrower interval means more certainty.",
  "Statistical Significance": "Whether the observed difference is unlikely to be random noise, given the chosen confidence level.",
  "Statistical Power": "The probability the experiment will detect a real lift of a given size, if one truly exists.",
  "Minimum Detectable Effect": "The smallest lift the experiment is designed to reliably catch.",
  "Incremental ROAS": "Revenue caused by the campaign, divided by ad spend. The honest ROAS.",
};
