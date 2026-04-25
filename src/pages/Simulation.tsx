import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { buildScenarios } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { TrendingUp, Heart, DollarSign, AlertTriangle } from "lucide-react";

const scenarios = buildScenarios();

const Simulation = () => {
  const [activeId, setActiveId] = useState(scenarios[1].id);
  const active = scenarios.find((s) => s.id === activeId)!;

  // merge for combined chart
  const econData = active.economic.map((p, i) => ({
    year: p.year,
    economic: p.value,
    none: scenarios[0].economic[i].value,
  }));
  const healthData = active.health.map((p, i) => ({
    year: p.year,
    health: p.value,
    none: scenarios[0].health[i].value,
  }));

  return (
    <AppLayout title="Simulation Engine" subtitle="5-year economic & health projections · 3 scenarios">
      {/* Scenario selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 animate-fade-in">
        {scenarios.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                active ? "border-primary bg-accent shadow-md-soft" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Scenario</div>
                  <div className="text-sm font-semibold mt-1">{s.name}</div>
                </div>
                <div className={`h-2 w-2 rounded-full ${active ? "bg-primary animate-pulse-soft" : "bg-muted-foreground/30"}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-snug">{s.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cost <span className="font-mono font-semibold text-foreground">€{s.cost.toLocaleString()}</span></span>
                <span className={`font-semibold ${s.netGain >= 0 ? "text-success" : "text-risk"}`}>
                  {s.netGain >= 0 ? "+" : ""}€{s.netGain.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<DollarSign />} label="Net 5yr gain" value={`€${active.netGain.toLocaleString()}`} tone={active.netGain >= 0 ? "success" : "risk"} />
        <SummaryCard icon={<TrendingUp />} label="Yield improvement" value={`${active.id === "none" ? "−35" : active.id === "remediation" ? "+58" : "+42"}%`} tone={active.id === "none" ? "risk" : "success"} />
        <SummaryCard icon={<Heart />} label="Health risk delta" value={`${active.id === "none" ? "+45" : active.id === "remediation" ? "−59" : "−39"}%`} tone={active.id === "none" ? "risk" : "success"} />
        <SummaryCard icon={<AlertTriangle />} label="Initial cost" value={`€${active.cost.toLocaleString()}`} tone="warning" />
      </div>

      {/* Economic chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Economic projection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Net revenue per hectare (EUR)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Selected</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />Baseline</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <AreaChart data={econData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="econ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="economic" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#econ)" animationDuration={800} />
                <Line type="monotone" dataKey="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Health risk projection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Composite health risk index (lower is better)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-risk" />Selected</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />Baseline</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={healthData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="health" stroke="hsl(var(--risk))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--risk))" }} animationDuration={800} />
                <Line type="monotone" dataKey="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed table */}
      <div className="mt-6 panel p-5 animate-fade-in">
        <h3 className="text-sm font-semibold mb-3">Year-by-year breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border">
              <th className="pb-2">Year</th>
              <th className="pb-2 text-right">Revenue (€/ha)</th>
              <th className="pb-2 text-right">Health risk</th>
              <th className="pb-2 text-right">Δ vs baseline</th>
            </tr>
          </thead>
          <tbody>
            {active.economic.map((p, i) => {
              const baseline = scenarios[0].economic[i].value;
              const delta = p.value - baseline;
              return (
                <tr key={p.year} className="border-b border-border/50 last:border-0">
                  <td className="py-3 font-mono font-semibold">{p.year}</td>
                  <td className="py-3 text-right font-mono tabular">€{p.value.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono tabular">{active.health[i].value.toFixed(1)}</td>
                  <td className={`py-3 text-right font-mono font-semibold tabular ${delta >= 0 ? "text-success" : "text-risk"}`}>
                    {delta >= 0 ? "+" : ""}€{delta.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button className="mt-4 bg-gradient-primary hover:opacity-90" size="sm">Export simulation report →</Button>
      </div>
    </AppLayout>
  );
};

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const tones: Record<string, { fg: string; bg: string }> = {
    success: { fg: "text-success", bg: "bg-accent" },
    risk: { fg: "text-risk", bg: "bg-risk-soft" },
    warning: { fg: "text-warning", bg: "bg-warning/10" },
    data: { fg: "text-data", bg: "bg-data-soft" },
  };
  const t = tones[tone];
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${t.bg} ${t.fg}`}>
          <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        </div>
      </div>
      <div className={`mt-2 text-2xl font-bold tabular ${t.fg}`}>{value}</div>
    </div>
  );
}

export default Simulation;
