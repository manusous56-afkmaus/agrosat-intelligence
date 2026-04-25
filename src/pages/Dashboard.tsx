import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Sprout, AlertTriangle, TrendingUp, Beaker, Map, BarChart3, Lightbulb, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { RECENT_ANALYSES, REGIONS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const avgHealth = Math.round(REGIONS.reduce((s, r) => s + r.healthRiskIndex, 0) / REGIONS.length);
  const avgSoil = Math.round(100 - REGIONS.reduce((s, r) => s + r.soilDegradation, 0) / REGIONS.length);
  const avgYield = (REGIONS.reduce((s, r) => s + r.yield, 0) / REGIONS.length).toFixed(1);
  const totalHa = REGIONS.reduce((s, r) => s + r.hectares, 0);

  return (
    <AppLayout
      title="Operations Overview"
      subtitle="Data-driven agricultural intelligence · 10 regions monitored"
      actions={
        <>
          <Button variant="outline" size="sm" asChild>
            <Link to="/parcel">Analyze parcel</Link>
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-sm-soft" asChild>
            <Link to="/satellite">Open satellite map</Link>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Soil health index" value={avgSoil} unit="/100" tone="success" delta={3.4}
          icon={<Sprout className="h-4 w-4" />} sparkline={[42, 48, 51, 49, 54, 58, avgSoil]} />
        <KpiCard label="Health risk index" value={avgHealth} unit="/100" tone="risk" delta={-2.1}
          icon={<AlertTriangle className="h-4 w-4" />} sparkline={[62, 60, 59, 58, 56, 54, avgHealth]} />
        <KpiCard label="Productivity score" value={avgYield} unit="t/ha" tone="data" delta={5.8}
          icon={<TrendingUp className="h-4 w-4" />} sparkline={[2.8, 3.0, 3.1, 3.0, 3.2, 3.3, +avgYield]} />
        <KpiCard label="Pesticide load" value="Med" tone="warning" delta={-12.4}
          icon={<Beaker className="h-4 w-4" />} sparkline={[80, 76, 72, 68, 65, 62, 58]} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick actions */}
        <div className="lg:col-span-1 panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Quick actions</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <ActionTile to="/satellite" icon={<Map className="h-4 w-4" />} title="Open satellite map" desc="Select & analyze parcels" tone="primary" />
            <ActionTile to="/parcel" icon={<Sprout className="h-4 w-4" />} title="Run parcel analysis" desc="Soil · moisture · yield" tone="data" />
            <ActionTile to="/simulation" icon={<BarChart3 className="h-4 w-4" />} title="Economic simulation" desc="5-year scenarios" tone="warning" />
            <ActionTile to="/insights" icon={<Lightbulb className="h-4 w-4" />} title="View recommendations" desc="6 actionable insights" tone="success" />
          </div>
        </div>

        {/* Recent analyses */}
        <div className="lg:col-span-2 panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Recent analyses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Latest parcel evaluations across monitored regions</p>
            </div>
            <Link to="/satellite" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-2 font-semibold">Parcel</th>
                  <th className="pb-2 font-semibold">Region</th>
                  <th className="pb-2 font-semibold text-right">Score</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                  <th className="pb-2 font-semibold text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ANALYSES.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 text-sm font-mono text-foreground">{a.parcel}</td>
                    <td className="py-3 text-sm text-muted-foreground">{a.region}</td>
                    <td className="py-3 text-sm text-right font-semibold tabular">{a.score}</td>
                    <td className="py-3 text-right">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 text-xs text-right text-muted-foreground tabular">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Region performance */}
      <div className="mt-6 panel p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold">Regional performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{(totalHa / 1000).toFixed(0)}k hectares · 10 governorates</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Soil · Risk · Yield</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {REGIONS.map((r) => (
            <RegionCard key={r.id} region={r} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    good: "bg-success/10 text-success",
    moderate: "bg-warning/10 text-warning",
    risk: "bg-risk/10 text-risk",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>
      {status}
    </span>
  );
}

function ActionTile({ to, icon, title, desc, tone }: { to: string; icon: React.ReactNode; title: string; desc: string; tone: string }) {
  const tones: Record<string, string> = {
    primary: "bg-accent text-primary",
    data: "bg-data-soft text-data",
    warning: "bg-warning/10 text-warning",
    success: "bg-accent text-success",
  };
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function RegionCard({ region }: { region: typeof REGIONS[0] }) {
  const soilScore = 100 - region.soilDegradation;
  return (
    <div className="rounded-lg border border-border p-3 hover:border-primary/30 hover:shadow-sm-soft transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">{region.name}</div>
          <div className="text-[10px] text-muted-foreground">{region.primaryCrop} · {(region.hectares / 1000).toFixed(0)}k ha</div>
        </div>
        <div className={`h-2 w-2 rounded-full ${region.healthRiskIndex > 70 ? "bg-risk" : region.healthRiskIndex > 45 ? "bg-warning" : "bg-success"}`} />
      </div>
      <div className="mt-3 space-y-1.5">
        <Bar label="Soil" value={soilScore} color="bg-success" />
        <Bar label="Risk" value={region.healthRiskIndex} color="bg-risk" />
        <Bar label="Yield" value={region.yield * 20} color="bg-data" suffix={`${region.yield}t`} />
      </div>
    </div>
  );
}

function Bar({ label, value, color, suffix }: { label: string; value: number; color: string; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] text-muted-foreground font-semibold uppercase">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-[10px] font-mono font-semibold w-8 text-right tabular">{suffix ?? Math.round(value)}</span>
    </div>
  );
}

export default Dashboard;
