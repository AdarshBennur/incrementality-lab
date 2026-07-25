import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeading } from "@/components/primitives";
import { ForestPlot, IncRevenueBySegment, LiftBySegment } from "@/components/charts";
import { analyzeSegment } from "@/lib/experiment-data";
import { useCurrentExperiment } from "@/lib/experiment-store";
import { fmtCurrency, fmtNum, fmtPctRaw, fmtSigned } from "@/lib/format";
import { useMemo, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/segments")({
  head: () => ({
    meta: [
      { title: "Segment Analysis — Causal Lab" },
      { name: "description", content: "Discover which audiences responded to your campaign, with lift, confidence intervals, and a forest plot of every segment." },
      { property: "og:title", content: "Segment Analysis — Causal Lab" },
      { property: "og:description", content: "Discover which audiences responded to your campaign, with lift, confidence intervals, and a forest plot of every segment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SegmentsPage,
});

function SegmentsPage() {
  const exp = useCurrentExperiment();
  const dims = useMemo(() => Array.from(new Set(exp.segments.map((s) => s.dimension))), [exp]);
  const [dim, setDim] = useState<string>("All");

  const filtered = useMemo(() => {
    return dim === "All" ? exp.segments : exp.segments.filter((s) => s.dimension === dim);
  }, [exp, dim]);

  const analyzed = filtered.map(analyzeSegment);
  const sortedByLift = [...analyzed].sort((a, b) => b.test.relLift - a.test.relLift);
  const strongest = sortedByLift[0];
  const weakest = sortedByLift[sortedByLift.length - 1];
  const sig = analyzed.filter((r) => r.test.significant);
  const inconclusive = analyzed.filter((r) => !r.test.significant);
  const negative = analyzed.filter((r) => r.test.relLift < 0);

  return (
    <AppShell>
      <div className="mb-10">
        <div className="editorial-eyebrow mb-3">Segment Analysis</div>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink max-w-3xl">
          Which audiences actually responded?
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          A campaign's average lift can hide meaningful variation. Segment analysis surfaces where the treatment worked,
          where it fell flat, and where it may have quietly backfired.
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-10 flex flex-wrap items-center gap-6">
        <div>
          <div className="editorial-eyebrow mb-2">Segment dimension</div>
          <Select value={dim} onValueChange={setDim}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All segments</SelectItem>
              {dims.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="hairline pt-0 sm:pt-0 sm:border-l sm:border-t-0 sm:border-border sm:pl-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Mini label="Segments" value={fmtNum(analyzed.length)} />
          <Mini label="Significant" value={fmtNum(sig.length)} accent />
          <Mini label="Inconclusive" value={fmtNum(inconclusive.length)} />
          <Mini label="Negative lift" value={fmtNum(negative.length)} />
        </div>
      </Card>

      {/* Insight cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-14">
        <InsightCard tone="positive" icon={<TrendingUp className="h-4 w-4" />} label="Strongest positive lift"
          headline={strongest.segment.name}
          detail={`${fmtSigned(strongest.test.relLift*100, 2, "%")} relative lift · ${fmtCurrency(strongest.incrementalRevenue)} incremental revenue. ${strongest.segment.dimension} segment responded materially harder than average.`} />
        <InsightCard tone="neutral" icon={<AlertTriangle className="h-4 w-4" />} label="Weakest / inconclusive"
          headline={weakest.segment.name}
          detail={`${fmtSigned(weakest.test.relLift*100, 2, "%")} relative lift, p = ${weakest.test.pValue.toFixed(3)}. Not enough signal to conclude the campaign moved the needle here.`} />
        <InsightCard tone="warning" icon={<TrendingDown className="h-4 w-4" />} label="Watchlist"
          headline={negative.length ? `${negative.length} segment${negative.length > 1 ? "s" : ""} show negative lift` : "No negative segments"}
          detail={negative.length
            ? "Investigate whether creative, frequency, or audience overlap may be suppressing outcomes for these audiences."
            : "No segment shows a directionally negative lift in this cut."} />
      </div>

      {/* Forest plot */}
      <SectionHeading eyebrow="Uncertainty" title="Forest plot"
        lede="Each row shows the point estimate of absolute lift and its 95% confidence interval. Filled markers are statistically significant." />
      <Card className="mb-14 lg:p-8">
        <ForestPlot segments={filtered} />
        <div className="mt-6 flex flex-wrap gap-6 text-[11px] text-muted-foreground hairline pt-6">
          <Legend swatch="bg-primary" label="Significant" />
          <Legend swatch="bg-muted-foreground" label="Inconclusive" />
          <Legend swatch="bg-destructive" label="Negative & significant" />
          <span className="ml-auto">Vertical line = zero effect</span>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Relative lift by segment</div>
            <div className="text-xs text-muted-foreground">%</div>
          </div>
          <LiftBySegment segments={filtered} />
        </Card>
        <Card>
          <div className="mb-4 flex items-baseline justify-between">
            <div className="font-serif text-xl">Incremental revenue by segment</div>
            <div className="text-xs text-muted-foreground">USD</div>
          </div>
          <IncRevenueBySegment segments={filtered} />
        </Card>
      </div>

      {/* Opportunity matrix */}
      <SectionHeading eyebrow="Where to invest" title="Segment opportunity matrix"
        lede="Magnitude of lift on the vertical axis, statistical confidence on the horizontal. Bubble area scales with incremental revenue." />
      <Card className="mb-14 lg:p-8">
        <OpportunityMatrix segments={filtered} />
      </Card>

      {/* Table */}
      <SectionHeading eyebrow="Detail" title="All segments" />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr className="border-b border-border">
                {["Segment", "Dimension", "Treat CVR", "Ctrl CVR", "Abs lift", "Rel lift", "95% CI", "p-value", "Sample", "Inc. Revenue"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analyzed.map((r) => (
                <tr key={r.segment.name} className="border-b border-border last:border-0 hover:bg-cream/60 transition-colors">
                  <td className="px-4 py-3 text-ink">{r.segment.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.segment.dimension}</td>
                  <td className="px-4 py-3 num">{fmtPctRaw(r.test.pTreat*100)}</td>
                  <td className="px-4 py-3 num">{fmtPctRaw(r.test.pCtrl*100)}</td>
                  <td className="px-4 py-3 num">{fmtSigned(r.test.absLift*100, 2, "pp")}</td>
                  <td className={`px-4 py-3 num ${r.test.relLift >= 0 ? "text-primary" : "text-destructive"}`}>{fmtSigned(r.test.relLift*100, 2, "%")}</td>
                  <td className="px-4 py-3 num text-muted-foreground text-[12px]">
                    {fmtSigned(r.test.ciLow*100, 2, "")} to {fmtSigned(r.test.ciHigh*100, 2, "pp")}
                  </td>
                  <td className="px-4 py-3 num">
                    <span className={r.test.significant ? "text-success" : "text-muted-foreground"}>
                      {r.test.pValue < 0.0001 ? "<0.0001" : r.test.pValue.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3 num text-muted-foreground">{fmtNum(r.segment.nTreat + r.segment.nCtrl)}</td>
                  <td className="px-4 py-3 num">{fmtCurrency(r.incrementalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="editorial-eyebrow">{label}</div>
      <div className={`mt-1 font-serif text-2xl num ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function InsightCard({
  tone, icon, label, headline, detail,
}: { tone: "positive" | "warning" | "neutral"; icon: React.ReactNode; label: string; headline: string; detail: string }) {
  const toneMap = {
    positive: "border-success/30",
    warning: "border-warning/40",
    neutral: "border-border",
  };
  return (
    <div className={`card-elev p-6 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2 editorial-eyebrow">
        <span className={tone === "positive" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground"}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 font-serif text-xl text-ink leading-snug">{headline}</div>
      <div className="mt-3 text-sm text-muted-foreground leading-relaxed">{detail}</div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function OpportunityMatrix({ segments }: { segments: import("@/lib/experiment-data").SegmentPrimitives[] }) {
  const rows = segments.map(analyzeSegment);
  const maxRev = Math.max(...rows.map((r) => Math.abs(r.incrementalRevenue)), 1);
  const maxAbsLift = Math.max(...rows.map((r) => Math.abs(r.test.relLift)), 0.01);

  return (
    <div className="relative h-[420px] rounded-lg border border-border bg-cream/40 p-6">
      {/* quadrant lines */}
      <div className="absolute inset-6">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />

        {/* labels */}
        <div className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">High lift · Uncertain</div>
        <div className="absolute top-2 right-2 text-[10px] uppercase tracking-[0.14em] text-primary">Invest</div>
        <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Deprioritize</div>
        <div className="absolute bottom-2 right-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Confident · Low lift</div>

        {rows.map((r) => {
          // x: significance (lower p = further right)
          const conf = Math.min(1, Math.max(0, 1 - Math.min(r.test.pValue, 1)));
          const x = conf * 100;
          // y: relative lift (higher lift = higher up)
          const y = 50 - (r.test.relLift / maxAbsLift) * 45;
          const size = 12 + (Math.abs(r.incrementalRevenue) / maxRev) * 44;
          return (
            <div
              key={r.segment.name}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className="rounded-full border-2 transition-transform group-hover:scale-110"
                style={{
                  width: size, height: size,
                  background: r.test.significant
                    ? "color-mix(in oklab, var(--color-primary) 22%, transparent)"
                    : "color-mix(in oklab, var(--color-muted-foreground) 18%, transparent)",
                  borderColor: r.test.significant ? "var(--color-primary)" : "var(--color-border-strong)",
                }}
              />
              <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] text-ink opacity-70 group-hover:opacity-100">
                {r.segment.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* axis labels */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Statistical Confidence →
      </div>
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 -rotate-90 origin-left text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Lift magnitude →
      </div>
    </div>
  );
}
