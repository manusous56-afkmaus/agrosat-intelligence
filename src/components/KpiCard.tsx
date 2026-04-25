import { ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  icon?: ReactNode;
  tone?: "default" | "success" | "risk" | "data" | "warning";
  sparkline?: number[];
}

const toneStyles = {
  default: "text-foreground",
  success: "text-success",
  risk: "text-risk",
  data: "text-data",
  warning: "text-warning",
};

const iconBg = {
  default: "bg-muted text-muted-foreground",
  success: "bg-accent text-success",
  risk: "bg-risk-soft text-risk",
  data: "bg-data-soft text-data",
  warning: "bg-warning/10 text-warning",
};

export function KpiCard({ label, value, unit, delta, icon, tone = "default", sparkline }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="panel p-5 hover:shadow-md-soft transition-shadow group animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="kpi-label">{label}</div>
        {icon && (
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${iconBg[tone]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`kpi-value ${toneStyles[tone]}`}>{value}</span>
        {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
      </div>
      {(delta !== undefined || sparkline) && (
        <div className="mt-3 flex items-center justify-between">
          {delta !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-success" : "text-risk"}`}>
              {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="tabular">{Math.abs(delta)}%</span>
              <span className="text-muted-foreground font-normal ml-1">vs last cycle</span>
            </div>
          )}
          {sparkline && <Sparkline data={sparkline} tone={tone} />}
        </div>
      )}
    </div>
  );
}

function Sparkline({ data, tone }: { data: number[]; tone: KpiCardProps["tone"] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60, h = 20;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const stroke = tone === "risk" ? "hsl(var(--risk))" : tone === "data" ? "hsl(var(--data))" : "hsl(var(--primary))";
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
