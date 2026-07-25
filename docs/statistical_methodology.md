# Statistical Methodology

This system employs robust, deterministic statistical tests written natively in TypeScript. It avoids depending on heavy third-party Python libraries, instead utilizing direct mathematical approximations.

## Two-Proportion Z-Test

The core of our statistical significance engine relies on a **Two-Proportion Z-Test**, which compares the conversion rates of two independent samples (Treatment vs Control) with binary outcomes (Converted: Yes/No).

**Algorithm Structure:**

1. **Calculate Point Estimates:**
   `pTreat = convTreat / nTreat` and `pCtrl = convCtrl / nCtrl`.
2. **Calculate Absolute & Relative Lift:**
   `Absolute Lift = pTreat - pCtrl`
   `Relative Lift = (pTreat - pCtrl) / pCtrl`
3. **Calculate Standard Error (Pooled):**
   We assume the null hypothesis (that both groups have the same true conversion rate). The pooled proportion is `pPool = (convTreat + convCtrl) / (nTreat + nCtrl)`.
   The Standard Error is `SE = sqrt(pPool * (1 - pPool) * (1/nTreat + 1/nCtrl))`.
4. **Calculate Z-Score & P-Value:**
   The test statistic is `Z = (pTreat - pCtrl) / SE`.
   We use the **Abramowitz & Stegun approximation** to compute the cumulative distribution function (CDF) for the standard normal distribution to find the two-tailed p-value.
5. **Confidence Intervals:**
   We calculate the unpooled Standard Error to construct the 95% Confidence Interval using the **Beasley-Springer-Moro** approximation for the inverse normal CDF.

## Incrementality Math

Marketing platforms report _Attributed Revenue_, which takes credit for any conversion where an ad was seen. Our system calculates _Incremental Revenue_, which is the revenue that only happened _because_ the ad was seen.

- **Baseline Conversions** = `Control CVR * Treatment Sample Size`
- **Incremental Conversions** = `Total Treatment Conversions - Baseline Conversions`
- **Incremental Revenue** = `Attributed Revenue - (Baseline Conversions * Avg Order Value)`
- **Incremental ROAS** = `Incremental Revenue / Ad Spend`

## Power Analysis & Sample Size Planning

To power the "Experiment Planner", we calculate the required sample size dynamically based on user inputs.

We use the standard formula for a two-tailed, two-proportion test:
`n = (Z(1-α/2) * sqrt(2*p_bar*(1-p_bar)) + Z(1-β) * sqrt(p1*(1-p1) + p2*(1-p2)))^2 / (p2 - p1)^2`

Where:

- `p1` is the Baseline CVR
- `p2` is the Minimum Detectable Effect (Baseline \* (1 + MDE))
- `p_bar` is the average of `p1` and `p2`
- `α` is the significance level (e.g. 0.05 for 95% confidence)
- `1-β` is the statistical power (e.g. 80%)

The system accounts for uneven traffic splits (e.g., 90/10) by scaling `nTreat` and `nCtrl` according to the required ratio `k`.
