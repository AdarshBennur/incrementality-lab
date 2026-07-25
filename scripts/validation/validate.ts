import * as fs from "fs";
import * as path from "path";
import { calculateIncrementality } from "../../analysis/incrementality/engine";
import { twoProportionTest } from "../../analysis/experimentation/engine";
import { requiredSampleSize } from "../../analysis/power_analysis/engine";
import { analyzeSegment } from "../../analysis/segmentation/engine";

const JSON_PATH = path.join(process.cwd(), "data", "processed", "experiment_results.json");

function validate() {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  const exp = data[0];

  console.log("--- Validating Data Integrity ---");
  // Reconcile treatment + control
  const totalConversions = exp.convTreat + exp.convCtrl;
  console.log(`Global Conversions: ${totalConversions}`);

  // Reconcile segments
  const devices = exp.segments.filter((s: { dimension: string }) => s.dimension === "Device");
  const segmentConv = devices.reduce(
    (sum: number, s: { convTreat: number; convCtrl: number }) => sum + s.convTreat + s.convCtrl,
    0,
  );
  console.log(`Segment Conversions (Device): ${segmentConv}`);

  if (totalConversions !== segmentConv) {
    console.error("ERROR: Segment conversions do not match global conversions!");
    process.exit(1);
  }

  console.log("\n--- Validating Statistical Engine ---");
  const test = twoProportionTest(exp.convTreat, exp.nTreat, exp.convCtrl, exp.nCtrl);

  console.log(`Treatment CVR: ${(test.pTreat * 100).toFixed(4)}%`);
  console.log(`Control CVR: ${(test.pCtrl * 100).toFixed(4)}%`);
  console.log(`Relative Lift: ${(test.relLift * 100).toFixed(4)}%`);
  console.log(`Significant? ${test.significant} (p = ${test.pValue})`);

  console.log("\n--- Validating Incrementality Engine ---");
  const inc = calculateIncrementality(
    test,
    exp.nTreat,
    exp.convTreat,
    exp.revTreat,
    exp.spend,
    exp.avgOrderValue,
  );
  console.log(`Incremental Conversions: ${inc.incrementalConv}`);
  console.log(`Incremental Revenue: ${inc.incrementalRevenue}`);
  console.log(
    `Incremental ROAS: ${inc.incrementalRoas.toFixed(2)}x (vs Traditional ${inc.traditionalRoas.toFixed(2)}x)`,
  );

  if (inc.baselineConv + inc.incrementalConv !== exp.convTreat) {
    console.error(
      "ERROR: Baseline + Incremental Conversions do not equal total treatment conversions!",
    );
    process.exit(1);
  }

  if (inc.baselineRevenue + inc.incrementalRevenue !== exp.revTreat) {
    console.error("ERROR: Baseline + Incremental Revenue do not equal total treatment revenue!");
    process.exit(1);
  }

  console.log("\n--- Validating Power Analysis ---");
  const powerResult = requiredSampleSize({
    baseline: test.pCtrl,
    mde: 0.05,
    confidence: 0.95,
    power: 0.8,
    splitTreat: 0.5,
  });
  console.log(`Required sample size per group for 5% MDE: ${powerResult.nCtrl}`);

  if (powerResult.nCtrl < 0 || isNaN(powerResult.nCtrl)) {
    console.error("ERROR: Power calculation returned invalid sample size.");
    process.exit(1);
  }

  console.log("\nVALIDATION PASSED.");
}

validate();
