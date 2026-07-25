import * as fs from "fs";
import * as path from "path";
import { SegmentAggregation } from "../../analysis/segmentation/engine";

const ENRICHED_DATA = path.join(process.cwd(), "data", "enriched", "marketing_AB_enriched.csv");
const OUTPUT_JSON = path.join(process.cwd(), "data", "processed", "experiment_results.json");

function computeResults() {
  console.log("Reading enriched data...");
  const content = fs.readFileSync(ENRICHED_DATA, "utf-8");
  const lines = content.split("\n");
  const headers = lines[0].split(",");

  // Global aggregates
  let nTreat = 0,
    nCtrl = 0;
  let convTreat = 0,
    convCtrl = 0;
  let revTreat = 0,
    revCtrl = 0;
  let spend = 0;

  // Daily aggregates
  const dailyMap: Record<string, { nT: number; nC: number; cT: number; cC: number }> = {};

  // Segment aggregates
  // Key: Dimension::Name -> SegmentAggregation
  const segmentsMap: Record<string, SegmentAggregation> = {};

  const getSegment = (dim: string, name: string): SegmentAggregation => {
    const key = `${dim}::${name}`;
    if (!segmentsMap[key]) {
      segmentsMap[key] = {
        dimension: dim,
        name,
        nTreat: 0,
        nCtrl: 0,
        convTreat: 0,
        convCtrl: 0,
        revenuePerConv: 0,
      };
    }
    return segmentsMap[key];
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");

    const testGroup = parts[1];
    const converted = parts[2] === "true";
    const revenue = parseFloat(parts[8]);
    const cost = parseFloat(parts[9]);
    const device = parts[10];
    const geography = parts[11];
    const audience = parts[12];
    const customerType = parts[13];
    const date = parts[14];
    const daypart = parts[15];

    // Global
    spend += cost;
    if (testGroup === "treatment") {
      nTreat++;
      if (converted) {
        convTreat++;
        revTreat += revenue;
      }
    } else {
      nCtrl++;
      if (converted) {
        convCtrl++;
        revCtrl += revenue;
      }
    }

    // Daily
    if (!dailyMap[date]) dailyMap[date] = { nT: 0, nC: 0, cT: 0, cC: 0 };
    if (testGroup === "treatment") {
      dailyMap[date].nT++;
      if (converted) dailyMap[date].cT++;
    } else {
      dailyMap[date].nC++;
      if (converted) dailyMap[date].cC++;
    }

    // Segments
    const segsToUpdate = [
      { dim: "Device", name: device },
      { dim: "Geography", name: geography },
      { dim: "Audience Segment", name: audience },
      { dim: "Customer Type", name: customerType },
      { dim: "Daypart", name: daypart },
    ];

    for (const s of segsToUpdate) {
      const seg = getSegment(s.dim, s.name);
      if (testGroup === "treatment") {
        seg.nTreat++;
        if (converted) seg.convTreat++;
      } else {
        seg.nCtrl++;
        if (converted) seg.convCtrl++;
      }
    }
  }

  // Finalize segments (calculate average revenue per conversion per segment)
  const segments = Object.values(segmentsMap);
  for (const seg of segments) {
    const totalConvs = seg.convTreat + seg.convCtrl;
    // For simplicity, we use the global average order value if there are no convs
    // In a real scenario we'd track rev per segment, but here we can just use the global average or estimate
    seg.revenuePerConv = totalConvs > 0 ? (revTreat + revCtrl) / (convTreat + convCtrl) : 0;
  }

  // Format Daily Time Series
  const dates = Object.keys(dailyMap).sort();
  let cumConvT = 0,
    cumConvC = 0;
  let cumNT = 0,
    cumNC = 0;
  const daily = dates.map((date, index) => {
    const d = dailyMap[date];
    cumConvT += d.cT;
    cumConvC += d.cC;
    cumNT += d.nT;
    cumNC += d.nC;
    return {
      day: index + 1,
      date,
      cvrTreat: cumNT > 0 ? cumConvT / cumNT : 0,
      cvrCtrl: cumNC > 0 ? cumConvC / cumNC : 0,
      cumConvTreat: cumConvT,
      cumConvCtrl: cumConvC,
    };
  });

  const avgOrderValue =
    convTreat + convCtrl > 0 ? (revTreat + revCtrl) / (convTreat + convCtrl) : 0;

  const resultPrimitives = {
    id: "exp-real-data-25",
    name: "Impact Lab Main Experiment",
    campaign: "Holiday Prospecting",
    channel: "Meta + YouTube",
    status: "Completed",
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    primaryKpi: "Purchase Conversion Rate",
    nTreat,
    nCtrl,
    convTreat,
    convCtrl,
    revTreat: Math.round(revTreat),
    revCtrl: Math.round(revCtrl),
    spend: Math.round(spend),
    avgOrderValue: Math.round(avgOrderValue),
    daily,
    segments,
  };

  console.log("Writing experiment results JSON...");
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify([resultPrimitives], null, 2));
  console.log("Done.");
}

computeResults();
