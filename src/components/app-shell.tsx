import { Link, useRouterState } from "@tanstack/react-router";
import { Beaker, TrendingUp, LayoutGrid, Sliders, Download, ChevronDown } from "lucide-react";
import { EXPERIMENTS } from "@/lib/experiment-data";
import { useExperimentStore } from "@/lib/experiment-store";
import type { ReactNode } from "react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/incrementality", label: "Incrementality", icon: TrendingUp },
  { to: "/segments", label: "Segments", icon: Beaker },
  { to: "/planner", label: "Planner", icon: Sliders },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { experimentId, setExperimentId } = useExperimentStore();
  const current = EXPERIMENTS.find((e) => e.id === experimentId) ?? EXPERIMENTS[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Beaker className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg tracking-tight">Causal</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Experiment Lab</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active =
                n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative px-3 py-2 text-sm transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[17px] h-px bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-left transition-colors hover:border-border-strong">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <div className="leading-tight">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Experiment</div>
                    <div className="text-xs font-medium max-w-[220px] truncate">{current.name}</div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[320px]">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Active Experiments
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {EXPERIMENTS.map((e) => (
                  <DropdownMenuItem
                    key={e.id}
                    onSelect={() => setExperimentId(e.id)}
                    className="flex-col items-start gap-0.5 py-2"
                  >
                    <div className="text-sm font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.channel} · {e.status}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.success("Report queued", { description: "PDF will be emailed shortly." })}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-8 py-12">{children}</main>

      <footer className="mx-auto max-w-[1440px] px-8 py-10 text-xs text-muted-foreground">
        <div className="hairline pt-6 flex justify-between">
          <span>Causal — Marketing Experimentation & Incrementality Lab</span>
          <span>Frontend demo · Deterministic data layer</span>
        </div>
      </footer>
    </div>
  );
}
