import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  DecisionBadge,
  KpiCard,
  SectionHeading,
  Stat,
  VerdictBadge,
} from "@/components/primitives";
import { IncrementalityWaterfall } from "@/components/charts";
import { analyze } from "@/lib/experiment-data";
import { useCurrentExperiment } from "@/lib/experiment-store";
import { fmtCurrency, fmtNum, fmtPct, fmtPctRaw, fmtSigned } from "@/lib/format";
import { Minus, Equal } from "lucide-react";

export const Route = createFileRoute("/incrementality")({
  head: () => ({
    meta: [
      { title: "Incrementality Analysis — Causal Lab" },
      {
        name: "description",
        content:
          "Separate attributed performance from genuinely incremental revenue and quantify the true ROAS of your marketing spend.",
      },
      { property: "og:title", content: "Incrementality Analysis — Causal Lab" },
      {
        property: "og:description",
        content:
          "Separate attributed performance from genuinely incremental revenue and quantify the true ROAS of your marketing spend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IncrementalityPage,
});

function IncrementalityPage() {
  const exp = useCurrentExperiment();
  const a = analyze(exp);

  return (
    <AppShell>
      <div className="mb-10">
        <div className="editorial-eyebrow mb-3">Incrementality Analysis</div>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink max-w-3xl">
          How much of the campaign's revenue was actually{" "}
          <em className="text-primary not-italic">caused</em> by the campaign?
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Attribution says what to give credit to. Incrementality says what would not have happened
          without it. The gap between them is where marketing budgets get quietly wasted — or
          convincingly justified.
        </p>
      </div>

      {/* Attribution vs Incremental */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Card className="lg:p-8">
          <div className="editorial-eyebrow mb-3">Attributed Performance</div>
          <div className="font-serif text-4xl text-ink num">{fmtCurrency(a.attributedRevenue)}</div>
          <div className="text-sm text-muted-foreground mt-2">
            The revenue standard reporting would credit to this campaign.
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Stat label="Observed Conversions" value={fmtNum(exp.convTreat)} />
            <Stat label="Traditional ROAS" value={`${a.traditionalRoas.toFixed(2)}×`} />
            <Stat label="Traditional CAC" value={fmtCurrency(a.traditionalCac, 2)} />
            <Stat label="Campaign Spend" value={fmtCurrency(exp.spend)} />
          </div>
        </Card>
        <Card className="p-4 sm:p-6 lg:p-8 bg-cream border-primary/20">
          <div className="editorial-eyebrow mb-3 text-primary">Incremental Performance</div>
          <div className="font-serif text-4xl text-primary num">
            {fmtCurrency(a.incrementalRevenue)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            The revenue that only exists because the campaign ran.
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <Stat label="Incremental Conversions" value={fmtNum(Math.round(a.incrementalConv))} />
            <Stat label="Incremental ROAS" value={`${a.incrementalRoas.toFixed(2)}×`} />
            <Stat label="Incremental CAC" value={fmtCurrency(a.incrementalCac, 2)} />
            <Stat label="Incrementality" value={fmtPct(a.incrementalityPct, 1)} />
          </div>
        </Card>
      </div>

      {/* Equation */}
      <Card className="mb-10 lg:p-10">
        <div className="editorial-eyebrow mb-6">The Incremental Lift Equation</div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6">
          <EqBlock
            label="Treatment CVR"
            value={fmtPctRaw(a.test.pTreat * 100)}
            note={`${fmtNum(exp.convTreat)} of ${fmtNum(exp.nTreat)}`}
          />
          <div className="flex justify-center text-muted-foreground py-2 md:py-0">
            <Minus className="h-6 w-6" />
          </div>
          <EqBlock
            label="Control CVR"
            value={fmtPctRaw(a.test.pCtrl * 100)}
            note={`${fmtNum(exp.convCtrl)} of ${fmtNum(exp.nCtrl)}`}
          />
          <div className="flex justify-center text-muted-foreground py-2 md:py-0">
            <Equal className="h-6 w-6 rotate-90 md:rotate-0" />
          </div>
          <EqBlock
            label="Incremental Lift"
            value={fmtSigned(a.test.absLift * 100, 2, "pp")}
            note={`${fmtSigned(a.test.relLift * 100, 2, "%")} relative`}
            highlight
          />
        </div>
      </Card>

      {/* Waterfall */}
      <SectionHeading
        eyebrow="Revenue Waterfall"
        title="From reported to real"
        lede="Observed revenue splits into what would have happened anyway (baseline) and what the campaign genuinely caused."
      />
      <Card className="mb-10 p-4 sm:p-6 lg:p-8">
        <IncrementalityWaterfall a={a} />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 hairline pt-6">
          <Stat label="Baseline Conversions" value={fmtNum(Math.round(a.baselineConv))} />
          <Stat label="Incremental Conversions" value={fmtNum(Math.round(a.incrementalConv))} />
          <Stat label="Cost / Incremental Conv." value={fmtCurrency(a.costPerIncrementalConv, 2)} />
          <Stat
            label="Incremental Profit (est.)"
            value={fmtCurrency(a.incrementalRevenue * 0.35 - exp.spend)}
          />
        </div>
      </Card>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        <KpiCard
          label="Incrementality %"
          tipTerm="Incrementality"
          value={fmtPct(a.incrementalityPct, 1)}
          sub="Share of revenue that's genuinely new"
          tone="primary"
        />
        <KpiCard
          label="Revenue Lift"
          value={fmtCurrency(a.incrementalRevenue)}
          sub="vs baseline"
          tone="positive"
        />
        <KpiCard
          label="Conversion Lift"
          value={fmtSigned(a.test.absLift * exp.nTreat, 0)}
          sub="Incremental conversions"
        />
        <KpiCard
          label="Cost per Inc. Conversion"
          value={fmtCurrency(a.incrementalCac, 2)}
          sub={`vs ${fmtCurrency(a.traditionalCac, 2)} traditional`}
        />
      </div>

      {/* Business impact + decision */}
      <SectionHeading eyebrow="Decision" title="Business Impact & Verdict" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 lg:p-10 space-y-5 leading-relaxed">
          <p className="font-serif text-2xl leading-snug text-ink">
            Of the <span className="num text-ink">{fmtCurrency(a.attributedRevenue)}</span>{" "}
            attributed to this campaign, roughly{" "}
            <span className="num text-primary">{fmtCurrency(a.incrementalRevenue)}</span> (
            {fmtPct(a.incrementalityPct, 0)}) is genuinely incremental. The remaining{" "}
            <span className="num text-muted-foreground">{fmtCurrency(a.baselineRevenue)}</span>{" "}
            would have arrived without any advertising.
          </p>
          <p className="text-sm text-muted-foreground">
            The traditional ROAS of{" "}
            <span className="text-ink num">{a.traditionalRoas.toFixed(2)}×</span> overstates
            performance by a factor of{" "}
            <span className="text-ink">
              {(a.traditionalRoas / Math.max(a.incrementalRoas, 0.01)).toFixed(1)}×
            </span>
            . The honest, causal ROAS is{" "}
            <span className="text-ink num">{a.incrementalRoas.toFixed(2)}×</span> — the number that
            should govern budget decisions.
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <VerdictBadge significant={a.test.significant} />
            <div className="text-sm text-muted-foreground">
              Confidence {fmtPctRaw(a.test.confidence * 100, 0)} · p ={" "}
              {a.test.pValue < 0.0001 ? "<0.0001" : a.test.pValue.toFixed(4)}
            </div>
          </div>
        </Card>
        <Card className="lg:p-10 flex flex-col justify-between gap-6">
          <div>
            <div className="editorial-eyebrow mb-3">Recommended Action</div>
            <DecisionBadge decision={a.decision} />
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {a.decision === "SCALE" &&
              "Incremental economics beat the payback threshold. Increase budget in disciplined steps and preserve a holdout to keep measuring."}
            {a.decision === "MAINTAIN" &&
              "Positive but modest incremental returns. Hold spend flat, iterate on creative, and re-test in a new window."}
            {a.decision === "ITERATE" &&
              "Result is too noisy or too small to justify scaling. Refine targeting or creative and re-run with more power."}
            {a.decision === "STOP" &&
              "Incremental returns don't cover the spend. Pause and redesign before re-launching."}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function EqBlock({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border ${highlight ? "border-primary/30 bg-cream" : "border-border bg-surface"} p-5`}
    >
      <div className="editorial-eyebrow">{label}</div>
      <div className={`mt-2 font-serif text-3xl num ${highlight ? "text-primary" : "text-ink"}`}>
        {value}
      </div>
      {note && <div className="mt-1 text-xs text-muted-foreground num">{note}</div>}
    </div>
  );
}
