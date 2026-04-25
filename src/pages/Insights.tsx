import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { INSIGHTS } from "@/lib/mockData";
import { Sprout, Beaker, Wheat, Droplets, TrendingUp, Heart, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryIcon = {
  soil: Sprout,
  pesticide: Beaker,
  crop: Wheat,
  water: Droplets,
};

const Insights = () => {
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium">("all");

  const filtered = filter === "all" ? INSIGHTS : INSIGHTS.filter((i) => i.priority === filter);

  return (
    <AppLayout title="Recommendations" subtitle="Actionable insights · ranked by impact">
      <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
        {(["all", "critical", "high", "medium"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`h-8 px-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === p
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {p} {p !== "all" && <span className="ml-1 opacity-60">{INSIGHTS.filter((i) => i.priority === p).length}</span>}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} recommendation{filtered.length !== 1 && "s"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((i) => <InsightCard key={i.id} insight={i} />)}
      </div>

      <div className="mt-8 panel-elevated p-6 lg:p-8 bg-gradient-hero text-primary-foreground animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Connecting soil health, productivity, and human health</h3>
            <p className="text-sm opacity-80 mt-1 max-w-2xl">
              Implementing the top 3 recommendations across monitored regions could generate
              <span className="font-semibold"> €34M in annual revenue</span> while reducing
              health-related claims by an estimated <span className="font-semibold">28%</span> over 5 years.
            </p>
          </div>
          <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            Generate executive brief →
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

function InsightCard({ insight }: { insight: typeof INSIGHTS[0] }) {
  const Icon = categoryIcon[insight.category];
  const priorityStyles = {
    critical: "bg-risk/10 text-risk border-risk/20",
    high: "bg-warning/10 text-warning border-warning/20",
    medium: "bg-data-soft text-data border-data/20",
  };
  return (
    <div className="panel p-5 hover:shadow-md-soft transition-all animate-fade-in group">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-sm-soft">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug">{insight.title}</h3>
            <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityStyles[insight.priority]}`}>
              {insight.priority}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{insight.description}</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Impact icon={<TrendingUp className="h-3 w-3" />} label="Economic" value={insight.economicImpact} tone="success" />
            <Impact icon={<Heart className="h-3 w-3" />} label="Health" value={insight.healthImpact} tone="data" />
            <Impact icon={<DollarSign className="h-3 w-3" />} label="Cost" value={insight.cost} tone="muted" />
          </div>

          <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all">
            View implementation plan <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Impact({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    success: "text-success",
    data: "text-data",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <div className={`flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${tones[tone]}`}>
        {icon}<span>{label}</span>
      </div>
      <div className="mt-1 text-xs font-semibold tabular text-foreground">{value}</div>
    </div>
  );
}

export default Insights;
