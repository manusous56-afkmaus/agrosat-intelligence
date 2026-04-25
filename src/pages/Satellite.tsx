import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { SatelliteMap, HeatLayer } from "@/components/SatelliteMap";
import { analyzeParcel } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Layers, Pencil, X, MapPin, Sprout, Droplets, AlertTriangle, TrendingUp, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Satellite = () => {
  const [layer, setLayer] = useState<HeatLayer>(null);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [polygon, setPolygon] = useState<[number, number][]>([]);

  const analysis = selected ? analyzeParcel(selected.lat, selected.lng) : null;

  return (
    <AppLayout title="Satellite Analysis" subtitle="Sentinel-2 · Esri World Imagery · Real GIS" fullBleed>
      <div className="relative h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-sidebar">
        <SatelliteMap
          activeLayer={layer}
          selected={selected}
          onParcelSelect={(lat, lng) => setSelected({ lat, lng })}
          drawMode={drawMode}
          drawnPolygon={polygon}
          onPolygonChange={setPolygon}
        />

        {/* Top-left: layers panel */}
        <div className="absolute top-4 left-4 z-10 panel-elevated bg-surface/95 backdrop-blur-md p-3 w-64 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Heatmap layers</span>
          </div>
          <div className="space-y-1.5">
            <LayerToggle label="Soil degradation" color="hsl(20 85% 55%)" active={layer === "soil"} onClick={() => setLayer(layer === "soil" ? null : "soil")} />
            <LayerToggle label="Pesticide intensity" color="hsl(290 70% 50%)" active={layer === "pesticide"} onClick={() => setLayer(layer === "pesticide" ? null : "pesticide")} />
            <LayerToggle label="Health risk zones" color="hsl(0 72% 51%)" active={layer === "health"} onClick={() => setLayer(layer === "health" ? null : "health")} />
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1.5">
            <Button
              variant={drawMode ? "default" : "outline"}
              size="sm"
              className={`w-full justify-start text-xs h-8 ${drawMode ? "bg-gradient-primary" : ""}`}
              onClick={() => setDrawMode((v) => !v)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {drawMode ? "Drawing parcel…" : "Draw parcel polygon"}
            </Button>
            {polygon.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8 text-muted-foreground" onClick={() => { setPolygon([]); setDrawMode(false); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear polygon ({polygon.length} pts)
              </Button>
            )}
          </div>
          {drawMode && (
            <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
              Click on the map to add vertices. 3+ points form a parcel.
            </p>
          )}
        </div>

        {/* Bottom-left legend */}
        {layer && (
          <div className="absolute bottom-12 left-4 z-10 panel-elevated bg-surface/95 backdrop-blur-md px-3 py-2 animate-fade-in">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
              {layer === "soil" ? "Degradation %" : layer === "health" ? "Risk index" : "Pesticide load"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tabular text-muted-foreground">Low</span>
              <div className="h-2 w-32 rounded-full" style={{
                background: layer === "soil" ? "linear-gradient(to right, hsl(35 92% 55%), hsl(0 72% 51%))"
                  : layer === "health" ? "linear-gradient(to right, hsl(0 72% 51% / 0.4), hsl(340 90% 40%))"
                  : "linear-gradient(to right, hsl(280 60% 55%), hsl(300 80% 35%))",
              }} />
              <span className="text-[10px] tabular text-muted-foreground">High</span>
            </div>
          </div>
        )}

        {/* Right side panel — parcel analysis */}
        {selected && analysis && (
          <div className="absolute top-4 right-4 bottom-4 z-10 w-[340px] panel-elevated bg-surface/98 backdrop-blur-md flex flex-col animate-fade-in-scale">
            <div className="p-4 border-b border-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <MapPin className="h-3 w-3" /> Selected parcel
                </div>
                <div className="mt-1 font-mono text-sm font-semibold">
                  {analysis.lat.toFixed(4)}°N, {analysis.lng.toFixed(4)}°E
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{analysis.region} governorate</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1 -mr-1 -mt-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Big score */}
              <div className="rounded-lg bg-gradient-primary p-4 text-primary-foreground">
                <div className="text-[10px] uppercase tracking-wider opacity-80 font-semibold">Soil quality score</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular">{analysis.soilQuality}</span>
                  <span className="text-sm opacity-80">/ 100</span>
                </div>
                <div className="mt-3 h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-foreground rounded-full" style={{ width: `${analysis.soilQuality}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Metric icon={<Droplets className="h-3.5 w-3.5" />} label="Moisture" value={`${analysis.moisture}%`} tone="data" />
                <Metric icon={<Sprout className="h-3.5 w-3.5" />} label="Salinity" value={`${analysis.salinity}%`} tone="warning" />
                <Metric icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Contamination" value={`${analysis.contamination}%`} tone="risk" />
                <Metric icon={<TrendingUp className="h-3.5 w-3.5" />} label="Expected yield" value={`${analysis.expectedYield} t/ha`} tone="success" />
              </div>

              <div className="panel p-3 space-y-2">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Soil composition</div>
                <Row label="pH level" value={analysis.ph.toString()} />
                <Row label="Organic matter" value={`${analysis.organicMatter}%`} />
                <Row label="Nitrogen (N)" value={`${analysis.nitrogen} mg/kg`} />
              </div>

              <Button asChild className="w-full bg-gradient-primary hover:opacity-90">
                <Link to="/parcel">Open full analysis →</Link>
              </Button>
            </div>
          </div>
        )}

        {!selected && (
          <div className="absolute bottom-4 right-4 z-10 panel-elevated bg-surface/95 backdrop-blur-md px-3.5 py-2.5 max-w-xs animate-fade-in">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-primary">Tip</div>
            <p className="text-xs text-foreground mt-0.5">Click anywhere on the satellite map to analyze a parcel.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function LayerToggle({ label, color, active, onClick }: { label: string; color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-all ${active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/60 text-foreground"}`}>
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color, opacity: active ? 1 : 0.4 }} />
      <span className="flex-1 text-left">{label}</span>
      <span className={`h-3.5 w-6 rounded-full transition-colors ${active ? "bg-primary" : "bg-muted"} relative`}>
        <span className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-all ${active ? "left-3" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  const tones: Record<string, string> = {
    data: "text-data bg-data-soft",
    warning: "text-warning bg-warning/10",
    risk: "text-risk bg-risk-soft",
    success: "text-success bg-accent",
  };
  return (
    <div className="panel p-2.5">
      <div className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${tones[tone]}`}>{icon}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-sm font-bold tabular mt-0.5">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}

export default Satellite;
