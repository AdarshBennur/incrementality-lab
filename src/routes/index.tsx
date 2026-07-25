import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ExperimentHeader } from "@/components/experiment-header";
import { KpiCard, SectionHeading, Card, VerdictBadge, Stat } from "@/components/primitives";
import {
  TreatmentVsControlBar,
  ConversionTrend,
  CumulativeLift,
  OutcomesBar,
} from "@/components/charts";
import { analyze } from "@/lib/experiment-data";
import { useCurrentExperiment } from "@/lib/experiment-store";
import { fmtCurrency, fmtNum, fmtPct, fmtPctRaw, fmtSigned } from "@/lib/format";
import { Sparkle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Experiment Overview — Impact Lab" },
      {
        name: "description",
        content:
          "Executive summary of a randomized marketing experiment: lift, incrementality, and statistical verdict.",
      },
      { property: "og:title", content: "Experiment Overview — Impact Lab" },
      {
        property: "og:description",
        content:
          "Executive summary of a randomized marketing experiment: lift, incrementality, and statistical verdict.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const exp = useCurrentExperiment();
  const a = analyze(exp);

  return (
    <AppShell>
      <ExperimentHeader exp={exp} />

      {/* Verdict banner */}
      <Card className="mb-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        <div className="flex-1">
          <div className="editorial-eyebrow mb-3">The Verdict</div>
          <div className="flex flex-wrap items-center gap-4">
            <VerdictBadge significant={a.test.significant} />
            <div className="font-serif text-2xl leading-tight text-ink">
              {a.test.significant
                ? `Treatment lifted ${exp.primaryKpi.toLowerCase()} by `
                : `Treatment shifted ${exp.primaryKpi.toLowerCase()} by `}
              <span className={a.test.relLift >= 0 ? "text-primary" : "text-destructive"}>
                {fmtSigned(a.test.relLift * 100, 2, "%")}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:border-l lg:border-border lg:pl-10">
          <Stat label="Confidence" value={fmtPctRaw(a.test.confidence * 100, 0)} />
          <Stat
            label="P-value"
            tipTerm="P-value"
            value={a.test.pValue < 0.0001 ? "< 0.0001" : a.test.pValue.toFixed(4)}
          />
          <Stat
            label="95% CI (abs)"
            tipTerm="Confidence Interval"
            value={`${fmtSigned(a.test.ciLow * 100, 2, "pp")} to ${fmtSigned(a.test.ciHigh * 100, 2, "pp")}`}
          />
          <Stat label="Sample" value={fmtNum(exp.nTreat + exp.nCtrl)} />
        </div>
      </Card>

      {/* KPI grid */}
      <SectionHeading
        eyebrow="At a Glance"
        title="Executive KPIs"
        lede="Every number below is derived from the same underlying experiment counts, so the story stays internally consistent."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        <KpiCard
          label="Treatment CVR"
          value={fmtPctRaw(a.test.pTreat * 100)}
          sub={`${fmtNum(exp.convTreat)} of ${fmtNum(exp.nTreat)}`}
        />
        <KpiCard
          label="Control CVR"
          value={fmtPctRaw(a.test.pCtrl * 100)}
          sub={`${fmtNum(exp.convCtrl)} of ${fmtNum(exp.nCtrl)}`}
        />
        <KpiCard
          label="Absolute Lift"
          tipTerm="Absolute Lift"
          tone="primary"
          value={fmtSigned(a.test.absLift * 100, 2, "pp")}
          sub="Percentage points"
        />
        <KpiCard
          label="Relative Lift"
          tipTerm="Relative Lift"
          tone={a.test.relLift >= 0 ? "positive" : "negative"}
          value={fmtSigned(a.test.relLift * 100, 2, "%")}
          sub="vs control baseline"
        />
        <KpiCard
          label="Incremental Conversions"
          value={fmtNum(Math.round(a.incrementalConv))}
          sub={`of ${fmtNum(exp.convTreat)} observed`}
        />
        <KpiCard
          label="Incremental Revenue"
          tone="primary"
          value={fmtCurrency(a.incrementalRevenue)}
          sub={`${fmtPct(a.incrementalityPct, 1)} of attributed`}
        />
        <KpiCard
          label="Statistical Significance"
          tipTerm="Statistical Significance"
          value={a.test.significant ? "Yes" : "No"}
          sub={`p = ${a.test.pValue < 0.0001 ? "<0.0001" : a.test.pValue.toFixed(4)}`}
        />
        <KpiCard
          label="Incremental ROAS"
          tipTerm="Incremental ROAS"
          tone={a.incrementalRoas >= 1 ? "positive" : "negative"}
          value={`${a.incrementalRoas.toFixed(2)}×`}
          sub={`vs ${a.traditionalRoas.toFixed(2)}× reported`}
        />
      </div>

      {/* Charts grid */}
      <SectionHeading eyebrow="Evidence" title="Visualizing the Effect" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Treatment vs Control CVR</div>
            <div className="text-xs text-muted-foreground">Primary KPI</div>
          </div>
          <TreatmentVsControlBar a={a} />
        </Card>
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Conversion Trend</div>
            <div className="text-xs text-muted-foreground">Daily rates</div>
          </div>
          <ConversionTrend p={exp} />
        </Card>
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Cumulative Lift Over Time</div>
            <div className="text-xs text-muted-foreground">Relative, %</div>
          </div>
          <CumulativeLift p={exp} />
        </Card>
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Outcomes</div>
            <div className="text-xs text-muted-foreground">Conversions & revenue</div>
          </div>
          <OutcomesBar p={exp} />
        </Card>
      </div>

      {/* Executive summary */}
      <SectionHeading eyebrow="The Analyst's Take" title="Executive Summary" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 lg:p-10 space-y-5 leading-relaxed">
          <div className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-[0.16em]">
            <Sparkle className="h-3 w-3" /> Written for stakeholders
          </div>
          <p className="font-serif text-2xl leading-snug text-ink">
            The {exp.channel} test{" "}
            <em className="not-italic text-primary">
              {a.test.significant
                ? "produced a real, measurable lift"
                : "did not produce a lift we can trust"}
            </em>{" "}
            on {exp.primaryKpi.toLowerCase()} — moving it from{" "}
            <span className="num">{fmtPctRaw(a.test.pCtrl * 100)}</span> to{" "}
            <span className="num">{fmtPctRaw(a.test.pTreat * 100)}</span> over {a.durationDays}{" "}
            days.
          </p>
          <p className="text-sm text-muted-foreground">
            The observed <span className="text-ink">{fmtSigned(a.test.relLift * 100, 2, "%")}</span>{" "}
            relative lift is
            {a.test.significant
              ? ` unlikely to be noise (p = ${a.test.pValue < 0.0001 ? "< 0.0001" : a.test.pValue.toFixed(4)}). We're 95% confident the true absolute lift sits between ${fmtSigned(a.test.ciLow * 100, 2, "pp")} and ${fmtSigned(a.test.ciHigh * 100, 2, "pp")}.`
              : ` within the range we'd expect by chance (p = ${a.test.pValue.toFixed(3)}). The 95% CI (${fmtSigned(a.test.ciLow * 100, 2, "pp")} to ${fmtSigned(a.test.ciHigh * 100, 2, "pp")}) crosses zero, meaning we can't rule out a null effect.`}
          </p>
          <p className="text-sm text-muted-foreground">
            After removing the {fmtNum(Math.round(a.baselineConv))} conversions the control group
            tells us would have happened anyway, the campaign is responsible for roughly{" "}
            <span className="text-ink num">{fmtNum(Math.round(a.incrementalConv))}</span>{" "}
            incremental conversions, or{" "}
            <span className="text-ink num">{fmtCurrency(a.incrementalRevenue)}</span> in genuine
            incremental revenue —{" "}
            <span className="text-ink num">{fmtPct(a.incrementalityPct, 0)}</span> of the{" "}
            {fmtCurrency(a.attributedRevenue)} last-click attribution would suggest.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="text-ink">Recommendation.</span>{" "}
            {a.decision === "SCALE" &&
              "The incremental ROAS clears the payback bar with room to spare. Scale spend, keep a holdout, and monitor for saturation."}
            {a.decision === "MAINTAIN" &&
              "Incremental economics are positive but not exceptional. Hold current investment and iterate on creative to expand the winning pattern."}
            {a.decision === "ITERATE" &&
              "The effect is too small (or too noisy) to justify scaling. Iterate on targeting or creative and re-test with a larger sample."}
            {a.decision === "STOP" &&
              "Incremental returns don't cover the spend. Pause the campaign in its current form and redesign before re-launching."}
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="editorial-eyebrow">What happened</div>
            <div className="font-serif text-xl text-ink">
              {fmtSigned(a.test.relLift * 100, 2, "%")} lift on {exp.primaryKpi.toLowerCase()}
            </div>
            <div className="text-sm text-muted-foreground">
              Treatment ran to {fmtNum(exp.nTreat)} users; control held out {fmtNum(exp.nCtrl)}.
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="editorial-eyebrow">Business impact</div>
            <div className="font-serif text-xl text-primary num">
              {fmtCurrency(a.incrementalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Genuinely incremental revenue on {fmtCurrency(exp.spend)} spend (
              {a.incrementalRoas.toFixed(2)}× incremental ROAS).
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="editorial-eyebrow">Next step</div>
            <div className="font-serif text-xl text-ink">
              {a.decision.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} the campaign
            </div>
            <div className="text-sm text-muted-foreground">
              See the Incrementality tab for the full economic breakdown.
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
