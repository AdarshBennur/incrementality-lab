import * as fs from "fs";
import * as path from "path";

const rawPath = path.join(process.cwd(), "data", "raw", "marketing_AB.csv");

function audit() {
  const content = fs.readFileSync(rawPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);

  let nTreat = 0;
  let nCtrl = 0;
  let convTreat = 0;
  let convCtrl = 0;

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 6) continue;

    // Columns: [0] row_index, [1] user id, [2] test group, [3] converted, [4] total ads, [5] most ads day, [6] most ads hour
    const group = cols[2];
    const converted = cols[3] === "True";

    if (group === "ad") {
      nTreat++;
      if (converted) convTreat++;
    } else if (group === "psa") {
      nCtrl++;
      if (converted) convCtrl++;
    }
  }

  const pTreat = convTreat / nTreat;
  const pCtrl = convCtrl / nCtrl;
  const relLift = (pTreat - pCtrl) / pCtrl;

  console.log(`--- FORENSIC AUDIT OF RAW CSV ---`);
  console.log(`Total Treatment: ${nTreat}`);
  console.log(`Total Control: ${nCtrl}`);
  console.log(`Conversions Treatment: ${convTreat}`);
  console.log(`Conversions Control: ${convCtrl}`);
  console.log(`Treatment CVR: ${(pTreat * 100).toFixed(4)}%`);
  console.log(`Control CVR: ${(pCtrl * 100).toFixed(4)}%`);
  console.log(`Relative Lift: ${(relLift * 100).toFixed(4)}%`);
}

audit();
