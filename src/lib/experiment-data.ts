// Centralized demo-data layer. Everything the UI shows derives from these
// primitives + the stats utilities. Replace the primitives with a real dataset
// later — component contracts remain the same.

import { twoProportionTest } from "@analysis/experimentation/engine";
import { calculateIncrementality } from "@analysis/incrementality/engine";
import {
  analyzeSegment as engineAnalyzeSegment,
  SegmentAggregation,
} from "@analysis/segmentation/engine";
import realData from "../../data/processed/experiment_results.json";

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

export const EXPERIMENTS: ExperimentPrimitives[] = realData as ExperimentPrimitives[];

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
  const durationDays =
    Math.round((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 86400000) + 1;
  const inc = calculateIncrementality(
    test,
    p.nTreat,
    p.convTreat,
    p.revTreat,
    p.spend,
    p.avgOrderValue,
  );

  return {
    primitives: p,
    test,
    durationDays,
    ...inc,
  };
}

export function analyzeSegment(s: SegmentPrimitives) {
  return engineAnalyzeSegment(s as SegmentAggregation);
}

export const GLOSSARY: Record<string, string> = {
  "Treatment Group": "The audience exposed to the campaign. Their behavior is what we measure.",
  "Control Group":
    "A randomized holdout audience not shown the campaign. Their behavior tells us what would have happened anyway.",
  "Absolute Lift":
    "Treatment conversion rate minus control conversion rate, expressed in percentage points.",
  "Relative Lift":
    "The absolute lift divided by the control conversion rate. Answers: how much better did treatment perform, in %.",
  Incrementality:
    "The share of observed outcomes that would not have occurred without the campaign.",
  "P-value":
    "The probability of seeing a difference this large (or larger) purely by chance if the campaign had no effect. Lower is stronger evidence.",
  "Confidence Interval":
    "The range that likely contains the true lift. A narrower interval means more certainty.",
  "Statistical Significance":
    "Whether the observed difference is unlikely to be random noise, given the chosen confidence level.",
  "Statistical Power":
    "The probability the experiment will detect a real lift of a given size, if one truly exists.",
  "Minimum Detectable Effect": "The smallest lift the experiment is designed to reliably catch.",
  "Incremental ROAS": "Revenue caused by the campaign, divided by ad spend. The honest ROAS.",
};
