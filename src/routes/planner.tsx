import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeading, Stat } from "@/components/primitives";
import { requiredSampleSize } from "@analysis/power_analysis/engine";
import { fmtCurrency, fmtNum, fmtPctRaw } from "@/lib/format";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Experiment Planner — Impact Lab" },
      {
        name: "description",
        content:
          "Design a rigorous marketing experiment before spending: sample size, duration, power, and readiness in one interactive tool.",
      },
      { property: "og:title", content: "Experiment Planner — Impact Lab" },
      {
        property: "og:description",
        content:
          "Design a rigorous marketing experiment before spending: sample size, duration, power, and readiness in one interactive tool.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [baseline, setBaseline] = useState(0.03); // 3%
  const [mde, setMde] = useState(0.05); // 5% relative lift
  const [confidence, setConfidence] = useState(0.95);
  const [power, setPower] = useState(0.8);
  const [splitTreat, setSplitTreat] = useState(0.5);
  const [dailyTraffic, setDailyTraffic] = useState(9000);
  const [aov, setAov] = useState(120);
  const [budget, setBudget] = useState(80000);

  const result = useMemo(
    () => requiredSampleSize({ baseline, mde, confidence, power, splitTreat }),
    [baseline, mde, confidence, power, splitTreat],
  );

  const days = Math.max(1, Math.ceil(result.total / dailyTraffic));
  const expectedIncConv = Math.round(result.nTreat * baseline * mde);
  const expectedIncRevenue = expectedIncConv * aov;

  const readiness = getReadiness({ days, total: result.total, budget, expectedIncRevenue, mde });

  return (
    <AppShell>
      <div className="mb-10">
        <div className="editorial-eyebrow mb-3">Experiment Planner</div>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-ink max-w-3xl">
          Design the next test before you spend a dollar.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground leading-relaxed">
          Tune the inputs on the left and watch sample size, duration, and expected business impact
          update instantly. A well-planned experiment is the cheapest one you'll ever run.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-8">
        {/* Inputs */}
        <Card className="lg:p-8 space-y-6 lg:sticky lg:top-24 self-start">
          <div className="editorial-eyebrow">Inputs</div>

          <SliderField
            label="Baseline conversion rate"
            hint="Current conversion rate you'd see without the campaign."
            value={baseline}
            min={0.001}
            max={0.2}
            step={0.001}
            display={fmtPctRaw(baseline * 100, 2)}
            onChange={setBaseline}
          />

          <SliderField
            label="Minimum detectable effect"
            hint="Smallest relative lift you'd care to catch."
            value={mde}
            min={0.005}
            max={0.5}
            step={0.005}
            display={`+${(mde * 100).toFixed(1)}%`}
            onChange={setMde}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="editorial-eyebrow">Confidence</Label>
              <Select value={String(confidence)} onValueChange={(v) => setConfidence(+v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.90">90%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                  <SelectItem value="0.99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="editorial-eyebrow">Statistical Power</Label>
              <Select value={String(power)} onValueChange={(v) => setPower(+v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.7">70%</SelectItem>
                  <SelectItem value="0.8">80%</SelectItem>
                  <SelectItem value="0.9">90%</SelectItem>
                  <SelectItem value="0.95">95%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SliderField
            label="Treatment / control split"
            hint={`${Math.round(splitTreat * 100)}% treatment / ${Math.round((1 - splitTreat) * 100)}% control`}
            value={splitTreat}
            min={0.1}
            max={0.9}
            step={0.05}
            display={`${Math.round(splitTreat * 100)}/${Math.round((1 - splitTreat) * 100)}`}
            onChange={setSplitTreat}
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="Daily traffic"
              value={dailyTraffic}
              onChange={setDailyTraffic}
              suffix="users/day"
            />
            <NumberField label="Avg. conversion value" value={aov} onChange={setAov} prefix="$" />
          </div>

          <NumberField
            label="Campaign budget (optional)"
            value={budget}
            onChange={setBudget}
            prefix="$"
          />
        </Card>

        {/* Outputs */}
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Outputs"
            title="What this experiment will require"
            lede="Sample size and duration derive from a two-proportion power calculation using your inputs."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="editorial-eyebrow">Total sample</div>
              <div className="font-serif text-3xl num text-ink mt-2">{fmtNum(result.total)}</div>
              <div className="text-xs text-muted-foreground mt-1 num">users</div>
            </Card>
            <Card className="p-5">
              <div className="editorial-eyebrow">Treatment</div>
              <div className="font-serif text-3xl num text-ink mt-2">{fmtNum(result.nTreat)}</div>
              <div className="text-xs text-muted-foreground mt-1 num">exposed</div>
            </Card>
            <Card className="p-5">
              <div className="editorial-eyebrow">Control</div>
              <div className="font-serif text-3xl num text-ink mt-2">{fmtNum(result.nCtrl)}</div>
              <div className="text-xs text-muted-foreground mt-1 num">held out</div>
            </Card>
            <Card className="p-5">
              <div className="editorial-eyebrow">Duration</div>
              <div className="font-serif text-3xl num text-primary mt-2">
                {fmtNum(days)}
                <span className="text-lg text-muted-foreground ml-1">days</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 num">
                at {fmtNum(dailyTraffic)}/day
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 lg:p-8">
              <div className="editorial-eyebrow mb-4">Expected outcome if the lift holds</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Stat label="Expected incremental conversions" value={fmtNum(expectedIncConv)} />
                <Stat
                  label="Potential incremental revenue"
                  value={fmtCurrency(expectedIncRevenue)}
                />
                <Stat
                  label="Expected treatment conversions"
                  value={fmtNum(Math.round(result.nTreat * baseline * (1 + mde)))}
                />
                <Stat
                  label="Expected control conversions"
                  value={fmtNum(Math.round(result.nCtrl * baseline))}
                />
              </div>
              <div className="mt-6 pt-6 hairline text-sm text-muted-foreground leading-relaxed">
                A {(mde * 100).toFixed(1)}% lift on a {(baseline * 100).toFixed(2)}% baseline is a
                small movement in absolute terms — which is exactly why the calculator asks for so
                many users. The smaller the effect you want to catch, the more sample you need to
                catch it reliably.
              </div>
            </Card>

            <Card className={`lg:p-8 border-${readiness.color}/30`}>
              <div className="editorial-eyebrow mb-3">Experiment readiness</div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`text-${readiness.color}`}>{readiness.icon}</div>
                <div
                  className={`font-serif text-2xl text-${readiness.color === "success" ? "success" : readiness.color === "warning" ? "warning" : readiness.color === "destructive" ? "destructive" : "ink"}`}
                >
                  {readiness.label}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{readiness.detail}</p>
            </Card>
          </div>

          {/* Sensitivity */}
          <Card className="lg:p-8">
            <div className="editorial-eyebrow mb-4">Sensitivity</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <Sensitivity
                label="Detect half the lift"
                note={`MDE = ${((mde / 2) * 100).toFixed(1)}%`}
                value={fmtNum(
                  requiredSampleSize({ baseline, mde: mde / 2, confidence, power, splitTreat })
                    .total,
                )}
              />
              <Sensitivity
                label="Double the daily traffic"
                note={`${fmtNum(dailyTraffic * 2)} users/day`}
                value={`${Math.max(1, Math.ceil(result.total / (dailyTraffic * 2)))} days`}
              />
              <Sensitivity
                label="Require 95% power"
                note="From current setting"
                value={fmtNum(
                  requiredSampleSize({ baseline, mde, confidence, power: 0.95, splitTreat }).total,
                )}
              />
            </div>
          </Card>

          {/* Pre-launch checklist */}
          <SectionHeading eyebrow="Before launch" title="Pre-launch checklist" />
          <Card className="lg:p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[
                {
                  title: "Primary KPI defined",
                  detail: "One metric wins or loses the experiment.",
                },
                {
                  title: "Treatment / control structure",
                  detail: `Randomized ${Math.round(splitTreat * 100)}/${Math.round((1 - splitTreat) * 100)} assignment at the user level.`,
                },
                {
                  title: "Minimum detectable effect",
                  detail: `Committed to detecting a ${(mde * 100).toFixed(1)}% relative lift.`,
                },
                {
                  title: "Sample size",
                  detail: `${fmtNum(result.total)} users allocated across both arms.`,
                },
                {
                  title: "Experiment duration",
                  detail: `${days} days at ${fmtNum(dailyTraffic)} users/day.`,
                },
                {
                  title: "Guardrail metrics",
                  detail: "Bounce rate, cost/conversion, CX complaints tracked.",
                },
                {
                  title: "Success criteria written",
                  detail: "Decision rules agreed before results are looked at.",
                },
                {
                  title: "Instrumentation validated",
                  detail: "Assignment, exposure, and conversion events QA'd end-to-end.",
                },
              ].map((c) => (
                <li key={c.title} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-ink">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function SliderField({
  label,
  hint,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label className="editorial-eyebrow">{label}</Label>
        <span className="font-serif text-lg num text-ink">{display}</span>
      </div>
      <Slider
        className="mt-3"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
      {hint && <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <Label className="editorial-eyebrow">{label}</Label>
      <div className="relative mt-2">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, +e.target.value || 0))}
          className={`num ${prefix ? "pl-7" : ""} ${suffix ? "pr-16" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Sensitivity({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-cream/50 p-4">
      <div className="flex items-center gap-1.5 editorial-eyebrow">
        <Info className="h-3 w-3" /> {label}
      </div>
      <div className="font-serif text-2xl num text-ink mt-2">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{note}</div>
    </div>
  );
}

function getReadiness({
  days,
  total,
  budget,
  expectedIncRevenue,
  mde,
}: {
  days: number;
  total: number;
  budget: number;
  expectedIncRevenue: number;
  mde: number;
}) {
  if (days > 60)
    return {
      label: "Too Short on Traffic",
      color: "warning",
      icon: <AlertTriangle className="h-5 w-5" />,
      detail: `${days} days is long enough to lose organizational patience. Consider a larger MDE, more traffic, or a shorter timeframe.`,
    };
  if (total > 1_500_000)
    return {
      label: "Over-sized",
      color: "warning",
      icon: <AlertTriangle className="h-5 w-5" />,
      detail: `${total.toLocaleString()} users is a heavy commitment. If you can accept a larger MDE, sample size drops sharply.`,
    };
  if (mde < 0.02)
    return {
      label: "Underpowered risk",
      color: "warning",
      icon: <AlertTriangle className="h-5 w-5" />,
      detail: `A ${(mde * 100).toFixed(1)}% MDE is very tight. Tiny effects need enormous samples — make sure you truly need this precision.`,
    };
  if (budget && expectedIncRevenue < budget * 0.4)
    return {
      label: "Weak expected ROI",
      color: "destructive",
      icon: <XCircle className="h-5 w-5" />,
      detail:
        "Even if the lift holds, expected incremental revenue is well below your budget. Reconsider MDE assumptions or spend.",
    };
  return {
    label: "Ready",
    color: "success",
    icon: <CheckCircle2 className="h-5 w-5" />,
    detail: `The plan is well-powered, appropriately sized, and finishes in ${days} days. You can launch with confidence.`,
  };
}
