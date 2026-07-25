import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/experiment-data";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("editorial-eyebrow", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow, title, lede, action,
}: { eyebrow?: string; title: string; lede?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-6">
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2 className="font-serif text-3xl md:text-[2rem] leading-[1.1] tracking-tight text-ink">
          {title}
        </h2>
        {lede && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("card-elev p-6", className)}>{children}</div>;
}

export function InfoTip({ term }: { term: keyof typeof GLOSSARY | string }) {
  const def = GLOSSARY[term as string];
  if (!def) return null;
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button aria-label={`About ${term}`} className="inline-flex text-muted-foreground/70 hover:text-foreground transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
          <div className="font-medium mb-1">{term}</div>
          <div className="text-muted-foreground">{def}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function KpiCard({
  label, value, sub, tone = "neutral", tipTerm,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "primary";
  tipTerm?: string;
}) {
  const toneClass = {
    neutral: "text-ink",
    positive: "text-success",
    negative: "text-destructive",
    primary: "text-primary",
  }[tone];
  return (
    <div className="card-elev p-6 flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        <div className="editorial-eyebrow">{label}</div>
        {tipTerm && <InfoTip term={tipTerm} />}
      </div>
      <div className={cn("font-serif text-4xl leading-none num", toneClass)}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground num">{sub}</div>}
    </div>
  );
}

export function VerdictBadge({ significant }: { significant: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]",
        significant
          ? "border-success/30 bg-success/8 text-success"
          : "border-warning/40 bg-warning/10 text-warning-foreground",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", significant ? "bg-success" : "bg-warning")} />
      {significant ? "Statistically Significant" : "Not Statistically Significant"}
    </div>
  );
}

export function DecisionBadge({ decision }: { decision: "SCALE" | "MAINTAIN" | "ITERATE" | "STOP" }) {
  const map = {
    SCALE:    { bg: "bg-success",     text: "text-success-foreground",     dot: "bg-white/70" },
    MAINTAIN: { bg: "bg-chart-2",     text: "text-primary-foreground",     dot: "bg-white/70" },
    ITERATE:  { bg: "bg-warning",     text: "text-warning-foreground",     dot: "bg-black/40" },
    STOP:     { bg: "bg-destructive", text: "text-destructive-foreground", dot: "bg-white/70" },
  }[decision];
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium tracking-[0.14em] text-sm", map.bg, map.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", map.dot)} />
      {decision}
    </div>
  );
}

export function Stat({ label, value, tipTerm }: { label: string; value: ReactNode; tipTerm?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {tipTerm && <InfoTip term={tipTerm} />}
      </div>
      <div className="mt-1 text-lg num text-ink">{value}</div>
    </div>
  );
}
