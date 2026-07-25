import { fmtDate, fmtNum } from "@/lib/format";
import type { ExperimentPrimitives } from "@/lib/experiment-data";
import { Eyebrow } from "./primitives";

export function ExperimentHeader({ exp }: { exp: ExperimentPrimitives }) {
  const durationDays =
    Math.round((new Date(exp.endDate).getTime() - new Date(exp.startDate).getTime()) / 86400000) +
    1;

  const meta = [
    { label: "Campaign", value: exp.campaign },
    { label: "Channel", value: exp.channel },
    { label: "Status", value: exp.status },
    { label: "Start", value: fmtDate(exp.startDate) },
    { label: "End", value: fmtDate(exp.endDate) },
    { label: "Duration", value: `${durationDays} days` },
    { label: "Primary KPI", value: exp.primaryKpi },
    { label: "Treatment", value: fmtNum(exp.nTreat) },
    { label: "Control", value: fmtNum(exp.nCtrl) },
  ];

  return (
    <header className="mb-12">
      <Eyebrow>Experiment Report · #{exp.id.replace("exp-", "")}</Eyebrow>
      <h1 className="mt-3 font-serif text-5xl md:text-6xl leading-[1.02] tracking-tight text-ink max-w-4xl">
        {exp.name}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
        A randomized holdout study measuring whether {exp.channel.toLowerCase()} exposure caused
        additional {exp.primaryKpi.toLowerCase().replace(" rate", "s")} — beyond what would have
        happened organically.
      </p>

      <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-y-5 gap-x-4 sm:gap-x-6 hairline pt-6">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {m.label}
            </dt>
            <dd className="mt-1 text-sm text-ink num">{m.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
