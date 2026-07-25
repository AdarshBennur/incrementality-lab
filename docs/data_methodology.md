# Data Methodology

## Source Data Overview

The original A/B testing dataset (`marketing_AB.csv`) is preserved entirely in its raw form inside `data/raw/`. It contains 588,101 rows of real anonymized user behavior from an ad campaign vs a public service announcement (PSA) control group.

**Genuine fields included in the source data:**

- `user id`: Unique identifier for the subject.
- `test group`: Treatment (ad) vs Control (psa).
- `converted`: Boolean outcome of whether the user converted.
- `total ads`: Total number of ad impressions served.
- `most ads day`: The day of the week the most ads were seen.
- `most ads hour`: The hour of the day the most ads were seen.

## Cleaning Process

The raw data is processed sequentially by our automated pipeline:

1. Strings for the conversion variable ("True" / "False") are mapped to actual Booleans.
2. Group labels ("ad" vs "psa") are mapped to standard terms ("treatment" vs "control").
3. Numeric fields are cast to native integer types to prevent string concatenation math errors.

## Deterministic Data Enrichment

The original dataset lacked several business dimensions necessary for a full Marketing Incrementality analysis. To support the frontend, we enriched the dataset with **synthetic fields**.
Crucially, this is done **deterministically** using a seeded hash of the `user id` (`cyrb53` hashing). This ensures that running the pipeline multiple times always produces the exact same dataset, and that synthetic attributes are distributed realistically rather than as pure noise.

**Synthetically Added Fields:**

- `campaign`: Hardcoded to "Holiday Prospecting".
- `channel`: Hardcoded to "Meta + YouTube".
- `revenue`: If `converted` is true, a simulated revenue value between $80 and $200 is assigned based on the user hash. If false, 0.
- `cost`: Simulated using the genuine `total ads` count multiplied by a synthetic CPM between $0.02 and $0.05, capped at $10 per user.
- `device`: Desktop (30%), Mobile (60%), Tablet (10%).
- `geography`: North America (50%), EMEA (30%), APAC (20%).
- `audience_segment`: New Visitors (60%), Returning (30%), Lookalike 1% (10%).
- `customer_type`: First-Time Buyers (70%), Repeat Customers (30%).
- `date`: A synthetic timestamp is spread randomly but deterministically across a 29-day window beginning Oct 14, 2025.
- `daypart`: Derived directly from the genuine `most ads hour` field (Morning, Afternoon, Evening, Late night).

These synthetic fields enable realistic, multi-dimensional segment analysis without falsifying the underlying conversion lift or treatment/control distribution.
