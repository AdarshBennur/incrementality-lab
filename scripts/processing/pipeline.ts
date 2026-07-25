import * as fs from "fs";
import * as path from "path";

const RAW_DATA = path.join(process.cwd(), "data", "raw", "marketing_AB.csv");
const ENRICHED_DATA = path.join(process.cwd(), "data", "enriched", "marketing_AB_enriched.csv");

// Deterministic hash for string -> number
function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function getSeededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function processData() {
  console.log("Reading raw data...");
  const content = fs.readFileSync(RAW_DATA, "utf-8");
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  console.log("Processing and enriching...");

  const outLines = [];
  const outHeaders = [
    "user_id",
    "test_group",
    "converted",
    "total_ads",
    "most_ads_day",
    "most_ads_hour",
    "campaign",
    "channel",
    "revenue",
    "cost",
    "device",
    "geography",
    "audience_segment",
    "customer_type",
    "date",
    "daypart",
  ];
  outLines.push(outHeaders.join(","));

  const startDate = new Date("2025-10-14T00:00:00Z");

  let processedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    // Original: ["", "user id", "test group", "converted", "total ads", "most ads day", "most ads hour"]
    const userId = parts[1].trim();
    const testGroupRaw = parts[2].trim();
    const convertedRaw = parts[3].trim();
    const totalAdsRaw = parts[4].trim();
    const mostAdsDay = parts[5].trim();
    const mostAdsHourRaw = parts[6].trim();

    // CLEAN
    const testGroup = testGroupRaw === "ad" ? "treatment" : "control";
    const converted = convertedRaw.toLowerCase() === "true";
    const totalAds = parseInt(totalAdsRaw, 10);
    const mostAdsHour = parseInt(mostAdsHourRaw, 10);

    // ENRICH (Deterministic based on user_id)
    const seed = cyrb53(userId);

    const campaign = "Holiday Prospecting";
    const channel = "Meta + YouTube";

    // Revenue: $80 to $200 if converted, else 0
    let revenue = 0;
    if (converted) {
      revenue = 80 + Math.floor(getSeededRandom(seed + 1) * 120);
    }

    // Cost: Base $0.02 to $0.05 per ad
    const cpm = 0.02 + getSeededRandom(seed + 2) * 0.03;
    let cost = totalAds * cpm;
    if (cost > 10) cost = 10; // Cap
    if (cost < 0) cost = 0;

    // Device
    const rDevice = getSeededRandom(seed + 3);
    const device = rDevice < 0.6 ? "Mobile" : rDevice < 0.9 ? "Desktop" : "Tablet";

    // Geography
    const rGeo = getSeededRandom(seed + 4);
    const geography = rGeo < 0.5 ? "North America" : rGeo < 0.8 ? "EMEA" : "APAC";

    // Audience Segment
    const rAudience = getSeededRandom(seed + 5);
    const audience =
      rAudience < 0.6 ? "New Visitors" : rAudience < 0.9 ? "Returning" : "Lookalike 1%";

    // Customer Type
    const rCustomer = getSeededRandom(seed + 6);
    const customerType = rCustomer < 0.7 ? "First-Time Buyers" : "Repeat Customers";

    // Date: spread across 29 days
    const daysOffset = Math.floor(getSeededRandom(seed + 7) * 29);
    const dDate = new Date(startDate.getTime() + daysOffset * 86400000);
    const dateStr = dDate.toISOString().slice(0, 10);

    // Daypart
    let daypart = "Late night (12–6a)";
    if (mostAdsHour >= 6 && mostAdsHour < 12) daypart = "Morning (6a–12p)";
    else if (mostAdsHour >= 12 && mostAdsHour < 18) daypart = "Afternoon (12–6p)";
    else if (mostAdsHour >= 18 && mostAdsHour <= 23) daypart = "Evening (6p–12a)";

    const outRow = [
      userId,
      testGroup,
      converted,
      totalAds,
      mostAdsDay,
      mostAdsHour,
      campaign,
      channel,
      revenue.toFixed(2),
      cost.toFixed(4),
      device,
      geography,
      audience,
      customerType,
      dateStr,
      daypart,
    ];

    outLines.push(outRow.join(","));
    processedCount++;
  }

  console.log(`Writing ${processedCount} rows to enriched data...`);
  fs.writeFileSync(ENRICHED_DATA, outLines.join("\n"));
  console.log("Done.");
}

processData();
