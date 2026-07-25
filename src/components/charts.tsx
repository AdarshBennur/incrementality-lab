import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid,
  Tooltip as RTooltip, LineChart, Line, Legend, AreaChart, Area,
  ReferenceLine, Cell,
} from "recharts";
import { fmtPct, fmtPctRaw, fmtNum, fmtCurrency, fmtSigned } from "@/lib/format";
import type { ExperimentAnalytics, ExperimentPrimitives } from "@/lib/experiment-data";
import { analyzeSegment } from "@/lib/experiment-data";
import type { SegmentPrimitives } from "@/lib/experiment-data";

const AXIS = { fontSize: 11, fill: "var(--color-muted-foreground)" } as const;
const GRID = "var(--color-border)";

function TooltipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {children}
    </div>
  );
}

export function TreatmentVsControlBar({ a }: { a: ExperimentAnalytics }) {
  const data = [
    { name: "Control", cvr: a.test.pCtrl * 100, fill: "var(--color-chart-2)" },
    { name: "Treatment", cvr: a.test.pTreat * 100, fill: "var(--color-primary)" },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
        <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v.toFixed(1)}%`} />
        <RTooltip cursor={{ fill: "var(--color-muted)" }}
          content={({ payload }) => payload?.length ? (
            <TooltipBox>
              <div className="font-medium">{payload[0].payload.name}</div>
              <div className="text-muted-foreground">Conversion rate: {payload[0].value?.toString().substring(0,5)}%</div>
            </TooltipBox>
          ) : null} />
        <Bar dataKey="cvr" radius={[6, 6, 0, 0]} barSize={72}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ConversionTrend({ p }: { p: ExperimentPrimitives }) {
  const data = p.daily.map((d) => ({
    date: d.date.slice(5),
    Treatment: +(d.cvrTreat * 100).toFixed(3),
    Control: +(d.cvrCtrl * 100).toFixed(3),
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
        <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} minTickGap={20} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v.toFixed(1)}%`} domain={["dataMin - 0.2", "dataMax + 0.2"]} />
        <RTooltip content={({ payload, label }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium mb-1">{label}</div>
            {payload.map((p) => (
              <div key={p.dataKey} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-muted-foreground">{p.dataKey}:</span>
                <span className="num">{(p.value as number).toFixed(2)}%</span>
              </div>
            ))}
          </TooltipBox>
        ) : null} />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="Control" stroke="var(--color-chart-2)" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="Treatment" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CumulativeLift({ p }: { p: ExperimentPrimitives }) {
  const perDayT = p.nTreat / p.daily.length;
  const perDayC = p.nCtrl / p.daily.length;
  const data = p.daily.map((d) => {
    const cvrT = d.cumConvTreat / (perDayT * d.day);
    const cvrC = d.cumConvCtrl / (perDayC * d.day);
    return { date: d.date.slice(5), lift: +((cvrT - cvrC) / cvrC * 100).toFixed(2) };
  });
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.24} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
        <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} minTickGap={20} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} />
        <ReferenceLine y={0} stroke="var(--color-border-strong)" />
        <RTooltip content={({ payload, label }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium">{label}</div>
            <div className="text-muted-foreground">Cumulative relative lift</div>
            <div className="num">{fmtSigned(payload[0].value as number, 2, "%")}</div>
          </TooltipBox>
        ) : null} />
        <Area type="monotone" dataKey="lift" stroke="var(--color-primary)" strokeWidth={2} fill="url(#liftGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OutcomesBar({ p }: { p: ExperimentPrimitives }) {
  const data = [
    { name: "Control", Conversions: p.convCtrl, Revenue: p.revCtrl },
    { name: "Treatment", Conversions: p.convTreat, Revenue: p.revTreat },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: -6, right: 12, top: 10, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
        <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis yAxisId="l" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => fmtNum(v)} />
        <YAxis yAxisId="r" orientation="right" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <RTooltip content={({ payload, label }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium mb-1">{label}</div>
            {payload.map((p) => (
              <div key={p.dataKey} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-muted-foreground">{p.dataKey}:</span>
                <span className="num">
                  {p.dataKey === "Revenue" ? fmtCurrency(p.value as number) : fmtNum(p.value as number)}
                </span>
              </div>
            ))}
          </TooltipBox>
        ) : null} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar yAxisId="l" dataKey="Conversions" fill="var(--color-chart-2)" radius={[4,4,0,0]} barSize={40} />
        <Bar yAxisId="r" dataKey="Revenue" fill="var(--color-primary)" radius={[4,4,0,0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncrementalityWaterfall({ a }: { a: ExperimentAnalytics }) {
  const data = [
    { name: "Observed\nRevenue", base: 0, value: a.attributedRevenue, fill: "var(--color-chart-2)" },
    { name: "Baseline\n(would-have-happened)", base: 0, value: a.baselineRevenue, fill: "var(--color-muted-foreground)" },
    { name: "Incremental\nRevenue", base: 0, value: a.incrementalRevenue, fill: "var(--color-primary)" },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: -6, right: 20, top: 20, bottom: 20 }}>
        <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
        <XAxis dataKey="name" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false}
          interval={0} height={40} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <RTooltip content={({ payload }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium">{payload[0].payload.name.replace("\n", " ")}</div>
            <div className="num">{fmtCurrency(payload[0].value as number)}</div>
          </TooltipBox>
        ) : null} />
        <Bar dataKey="value" radius={[6,6,0,0]} barSize={80}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LiftBySegment({ segments }: { segments: SegmentPrimitives[] }) {
  const data = segments.map((s) => {
    const r = analyzeSegment(s);
    return {
      name: s.name,
      lift: +(r.test.relLift * 100).toFixed(2),
      significant: r.test.significant,
    };
  });
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} strokeDasharray="2 4" />
        <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} />
        <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={150} />
        <ReferenceLine x={0} stroke="var(--color-border-strong)" />
        <RTooltip content={({ payload }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium">{payload[0].payload.name}</div>
            <div className="num">Relative lift: {fmtSigned(payload[0].value as number, 2, "%")}</div>
            <div className="text-muted-foreground text-[11px] mt-0.5">
              {payload[0].payload.significant ? "Statistically significant" : "Not significant"}
            </div>
          </TooltipBox>
        ) : null} />
        <Bar dataKey="lift" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.significant ? (d.lift >= 0 ? "var(--color-primary)" : "var(--color-destructive)") : "var(--color-muted-foreground)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function IncRevenueBySegment({ segments }: { segments: SegmentPrimitives[] }) {
  const data = segments.map((s) => ({ name: s.name, rev: Math.round(analyzeSegment(s).incrementalRevenue) }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, data.length * 28)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
        <CartesianGrid stroke={GRID} horizontal={false} strokeDasharray="2 4" />
        <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} width={150} />
        <RTooltip content={({ payload }) => payload?.length ? (
          <TooltipBox>
            <div className="font-medium">{payload[0].payload.name}</div>
            <div className="num">{fmtCurrency(payload[0].value as number)} incremental</div>
          </TooltipBox>
        ) : null} />
        <Bar dataKey="rev" radius={[0,4,4,0]} barSize={16} fill="var(--color-chart-3)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Forest plot ---------------------------------------------------------

export function ForestPlot({ segments }: { segments: SegmentPrimitives[] }) {
  const rows = segments.map((s) => {
    const r = analyzeSegment(s);
    return {
      name: s.name,
      dim: s.dimension,
      point: r.test.absLift * 100,
      low: r.test.ciLow * 100,
      high: r.test.ciHigh * 100,
      significant: r.test.significant,
    };
  });
  const min = Math.min(...rows.map((r) => r.low), 0);
  const max = Math.max(...rows.map((r) => r.high), 0);
  const range = max - min || 1;
  const toPct = (v: number) => ((v - min) / range) * 100;

  return (
    <div className="space-y-1.5">
      {/* axis */}
      <div className="relative h-6 mb-2 ml-[180px] mr-2">
        <div className="absolute top-3 inset-x-0 h-px bg-border-strong" />
        {[min, (min + max) / 2, max].map((tick, i) => (
          <div key={i} className="absolute top-0" style={{ left: `${toPct(tick)}%`, transform: "translateX(-50%)" }}>
            <div className="h-3 w-px bg-border-strong mx-auto" />
            <div className="text-[10px] text-muted-foreground num mt-0.5">
              {fmtSigned(tick, 2, "pp")}
            </div>
          </div>
        ))}
        <div className="absolute top-3 h-px w-px" style={{ left: `${toPct(0)}%` }}>
          <div className="absolute -top-3 h-6 w-px bg-primary/50" />
        </div>
      </div>

      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3 text-xs group">
          <div className="w-[170px] truncate">
            <span className="text-ink">{r.name}</span>{" "}
            <span className="text-muted-foreground">· {r.dim}</span>
          </div>
          <div className="relative flex-1 h-6">
            <div className="absolute top-1/2 -translate-y-1/2 h-px bg-border" style={{
              left: `${toPct(r.low)}%`, width: `${toPct(r.high) - toPct(r.low)}%`,
              background: r.significant ? "var(--color-primary)" : "var(--color-border-strong)",
            }} />
            {/* CI whiskers */}
            {[r.low, r.high].map((v, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2 h-2 w-px" style={{
                left: `${toPct(v)}%`,
                background: r.significant ? "var(--color-primary)" : "var(--color-border-strong)",
              }} />
            ))}
            {/* zero line reference */}
            <div className="absolute top-0 bottom-0 w-px bg-ink/10" style={{ left: `${toPct(0)}%` }} />
            {/* point estimate */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-sm"
              style={{
                left: `${toPct(r.point)}%`,
                background: r.significant ? "var(--color-primary)" : "var(--color-muted-foreground)",
              }}
            />
          </div>
          <div className="w-24 text-right num text-muted-foreground">
            {fmtSigned(r.point, 2, "pp")}
          </div>
        </div>
      ))}
    </div>
  );
}

// small util re-export
export { fmtPct, fmtPctRaw };
