import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { REGIONS, analyzeParcel } from "@/lib/mockData";
import { Sprout, Droplets, AlertTriangle, TrendingUp, FlaskConical, Beaker } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";

const Parcel = () => {
  const [regionId, setRegionId] = useState(REGIONS[0].id);
  const region = REGIONS.find((r) => r.id === regionId)!;
  const a = analyzeParcel(region.lat + 0.05, region.lng + 0.05);

  const radarData = [
    { trait: "Soil", v: a.soilQuality },
    { trait: "Moisture", v: a.moisture },
    { trait: "pH balance", v: Math.round(((a.ph - 5) / 4) * 100) },
    { trait: "Organic", v: Math.round(a.organicMatter * 25) },
    { trait: "Nitrogen", v: a.nitrogen },
    { trait: "Yield", v: Math.round(a.expectedYield * 20) },
  ];

  const compoundData = [
    { name: "Nitrogen", value: a.nitrogen, fill: "hsl(var(--primary))" },
    { name: "Phosphorus", value: 45 + (a.nitrogen % 30), fill: "hsl(var(--data))" },
    { name: "Potassium", value: 60 + (a.salinity % 20), fill: "hsl(var(--warning))" },
    { name: "Calcium", value: 38 + (a.contamination % 25), fill: "hsl(var(--success))" },
    { name: "Magnesium", value: 28 + (a.moisture % 20), fill: "hsl(var(--primary-glow))" },
  ];

  return (
    <AppLayout
      title="Parcel Analysis"
      subtitle={`Detailed evaluation · ${region.name} governorate`}
      actions={
        <select
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          className="h-9 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:border-foreground/20 transition"
        >
          {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      }
    >
      {/* Score banner */}
      <div className="rounded-xl bg-gradient-hero p-6 lg:p-8 text-primary-foreground shadow-lg-soft animate-fade-in">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">Composite quality score</div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-6xl font-bold tabular">{a.soilQuality}</span>
              <span className="text-2xl font-light opacity-80">/ 100</span>
            </div>
            <p className="mt-2 text-sm opacity-80 max-w-md">
              {a.soilQuality >= 70 ? "Excellent agricultural conditions. Suitable for high-value crops."
                : a.soilQuality >= 50 ? "Moderate conditions. Improvements recommended for optimal yield."
                : "Degraded conditions. Significant intervention required before cultivation."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Stat label="Region" value={region.name} />
            <Stat label="Crop type" value={region.primaryCrop} />
            <Stat label="Coords" value={`${a.lat.toFixed(2)}°, ${a.lng.toFixed(2)}°`} mono />
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Sprout />} label="Soil quality" value={a.soilQuality} unit="/100" tone="success" />
        <MetricCard icon={<Beaker />} label="Salinity" value={a.salinity} unit="%" tone="warning" />
        <MetricCard icon={<Droplets />} label="Moisture" value={a.moisture} unit="%" tone="data" />
        <MetricCard icon={<AlertTriangle />} label="Contamination" value={a.contamination} unit="%" tone="risk" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Multi-factor profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Normalized 0–100 across 6 traits</p>
            </div>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }} />
                <Radar name="Profile" dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Soil composition</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Macro-nutrients (mg/kg)</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">NPK + Ca/Mg</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compoundData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail tables */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Yield projection</h3>
          <div className="text-3xl font-bold tabular">{a.expectedYield} <span className="text-sm font-normal text-muted-foreground">t/ha</span></div>
          <div className="mt-2 text-xs text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{((a.expectedYield - region.yield) * 100 / region.yield).toFixed(1)}% vs regional avg</div>
          <div className="mt-4 space-y-2">
            <DataRow label="Best season" value="Mar–Jun" />
            <DataRow label="Water need" value={`${Math.round(a.moisture * 6)}mm`} />
            <DataRow label="Cycle length" value="120 days" />
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Risk assessment</h3>
          <div className="space-y-2">
            <RiskRow label="Soil-borne pathogens" level={a.contamination > 50 ? "high" : "medium"} />
            <RiskRow label="Heavy metals" level={a.contamination > 60 ? "high" : "low"} />
            <RiskRow label="Salinity stress" level={a.salinity > 60 ? "high" : a.salinity > 40 ? "medium" : "low"} />
            <RiskRow label="Drought exposure" level={a.moisture < 30 ? "high" : "medium"} />
            <RiskRow label="Pesticide residue" level={region.pesticideLevel} />
          </div>
        </div>
        <div className="panel p-5">
          <h3 className="text-sm font-semibold mb-3">Recommended actions</h3>
          <div className="space-y-2 text-xs">
            <p className="flex gap-2"><span className="text-success">✓</span> Apply organic compost (4 t/ha)</p>
            <p className="flex gap-2"><span className="text-success">✓</span> Install drip irrigation in zone B</p>
            <p className="flex gap-2"><span className="text-warning">!</span> Monitor pH monthly (target 6.8)</p>
            <p className="flex gap-2"><span className="text-warning">!</span> Reduce nitrogen by 18%</p>
            <p className="flex gap-2"><span className="text-risk">×</span> Halt synthetic pesticide application</p>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4 text-xs">Generate full report →</Button>
        </div>
      </div>
    </AppLayout>
  );
};

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 font-semibold">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, tone }: { icon: React.ReactNode; label: string; value: number; unit: string; tone: string }) {
  const tones: Record<string, { bg: string; fg: string; bar: string }> = {
    success: { bg: "bg-accent", fg: "text-success", bar: "bg-success" },
    data: { bg: "bg-data-soft", fg: "text-data", bar: "bg-data" },
    warning: { bg: "bg-warning/10", fg: "text-warning", bar: "bg-warning" },
    risk: { bg: "bg-risk-soft", fg: "text-risk", bar: "bg-risk" },
  };
  const t = tones[tone];
  return (
    <div className="panel p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${t.bg} ${t.fg}`}>
          <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-3xl font-bold tabular ${t.fg}`}>{value}</span>
        <span className="text-xs font-medium text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2.5 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${t.bar} rounded-full transition-all`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

function RiskRow({ label, level }: { label: string; level: string }) {
  const map: Record<string, string> = {
    low: "bg-success/15 text-success",
    medium: "bg-warning/15 text-warning",
    high: "bg-risk/15 text-risk",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground">{label}</span>
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${map[level]}`}>{level}</span>
    </div>
  );
}

export default Parcel;
