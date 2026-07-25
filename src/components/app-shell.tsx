import { Link, useRouterState } from "@tanstack/react-router";
import { Beaker, TrendingUp, LayoutGrid, Sliders, Download, ChevronDown, Menu } from "lucide-react";
import { EXPERIMENTS } from "@/lib/experiment-data";
import { useExperimentStore } from "@/lib/experiment-store";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 md:gap-8 px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <img
                      src="/assets/impact-lab-icon.png"
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0"
                    />
                    <div className="leading-tight">
                      <div className="font-serif text-lg tracking-tight">Impact Lab</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">
                        Experimentation Platform
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {nav.map((n) => {
                    const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                    const Icon = n.icon;
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/assets/impact-lab-icon.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 shrink-0"
              />
              <div className="leading-tight">
                <div className="font-serif text-lg tracking-tight">Impact Lab</div>
                <div className="hidden md:block text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">
                  Experimentation Platform
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative px-3 py-2 text-sm transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {n.label}
                  {active && <span className="absolute inset-x-3 -bottom-[17px] h-px bg-primary" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-left transition-colors hover:border-border-strong">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <div className="leading-tight">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Experiment
                    </div>
                    <div className="text-xs font-medium max-w-[120px] md:max-w-[220px] truncate">
                      {current.name}
                    </div>
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
                    <div className="text-xs text-muted-foreground">
                      {e.channel} · {e.status}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                toast.success("Report queued", { description: "PDF will be emailed shortly." })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 md:px-8 py-8 md:py-12">{children}</main>

      <footer className="mx-auto max-w-[1440px] px-4 md:px-8 py-10 text-xs text-muted-foreground">
        <div className="hairline pt-6 flex flex-col sm:flex-row gap-4 sm:justify-between">
          <span>Impact Lab — Marketing Experimentation Platform</span>
          <span>Frontend demo · Deterministic data layer</span>
        </div>
      </footer>
    </div>
  );
}
