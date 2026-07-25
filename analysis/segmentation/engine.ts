import { twoProportionTest, TwoPropResult } from "../experimentation/engine";

export interface SegmentAggregation {
  dimension: string;
  name: string;
  nTreat: number;
  nCtrl: number;
  convTreat: number;
  convCtrl: number;
  revenuePerConv: number;
}

export interface SegmentAnalysisResult {
  segment: SegmentAggregation;
  test: TwoPropResult;
  incrementalConv: number;
  incrementalRevenue: number;
}

export function analyzeSegment(s: SegmentAggregation): SegmentAnalysisResult {
  const test = twoProportionTest(s.convTreat, s.nTreat, s.convCtrl, s.nCtrl);
  const baseline = test.pCtrl * s.nTreat;
  const incrementalConv = s.convTreat - baseline;
  const incrementalRevenue = incrementalConv * s.revenuePerConv;

  return {
    segment: s,
    test,
    incrementalConv,
    incrementalRevenue,
  };
}

export function analyzeAllSegments(segments: SegmentAggregation[]): SegmentAnalysisResult[] {
  return segments.map(analyzeSegment);
}
