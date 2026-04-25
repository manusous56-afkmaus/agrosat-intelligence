import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import { REGIONS, TUNISIA_CENTER, TUNISIA_BOUNDS } from "@/lib/mockData";

export type HeatLayer = "soil" | "pesticide" | "health" | null;

interface SatelliteMapProps {
  onParcelSelect?: (lat: number, lng: number) => void;
  activeLayer?: HeatLayer;
  selected?: { lat: number; lng: number } | null;
  drawnPolygon?: [number, number][];
  onPolygonChange?: (pts: [number, number][]) => void;
  drawMode?: boolean;
}

// Free Esri World Imagery satellite tiles (no API key required)
const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri · Maxar · Earthstar Geographics",
      maxzoom: 19,
    },
    labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      maxzoom: 17,
    },
  },
  layers: [
    { id: "satellite", type: "raster", source: "satellite" },
    { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.85 } },
  ],
};

export function SatelliteMap({
  onParcelSelect, activeLayer, selected, drawnPolygon, onPolygonChange, drawMode,
}: SatelliteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const selectedMarkerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const polyRef = useRef<[number, number][]>([]);

  // init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: TUNISIA_CENTER,
      zoom: 6,
      maxBounds: [[5, 28], [14, 39]],
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.on("load", () => {
      // region markers
      REGIONS.forEach((r) => {
        const el = document.createElement("div");
        el.className = "region-pin";
        const color = r.healthRiskIndex > 70 ? "hsl(0 72% 51%)"
          : r.healthRiskIndex > 45 ? "hsl(35 92% 50%)"
          : "hsl(152 60% 38%)";
        el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 2px ${color}40, 0 2px 6px rgba(0,0,0,.4);cursor:pointer;`;
        const popup = new Popup({ offset: 14, closeButton: false }).setHTML(`
          <div class="p-3 min-w-[180px]">
            <div class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Region</div>
            <div class="text-sm font-semibold mt-0.5">${r.name}</div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-[11px]">
              <div><div class="text-muted-foreground">Soil deg.</div><div class="font-mono font-semibold">${r.soilDegradation}%</div></div>
              <div><div class="text-muted-foreground">Health risk</div><div class="font-mono font-semibold">${r.healthRiskIndex}</div></div>
              <div><div class="text-muted-foreground">Yield</div><div class="font-mono font-semibold">${r.yield} t/ha</div></div>
              <div><div class="text-muted-foreground">Pesticide</div><div class="font-mono font-semibold">${r.pesticideLevel}</div></div>
            </div>
          </div>`);
        const m = new Marker({ element: el }).setLngLat([r.lng, r.lat]).setPopup(popup).addTo(map);
        markersRef.current.push(m);
      });

      // heatmap source
      map.addSource("heat", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "heat-layer",
        type: "heatmap",
        source: "heat",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "v"], 0, 0, 100, 1],
          "heatmap-intensity": 1.4,
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 5, 35, 9, 80],
          "heatmap-opacity": 0.65,
        },
      });

      // polygon source
      map.addSource("poly", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "poly-fill", type: "fill", source: "poly",
        paint: { "fill-color": "hsl(152 50% 45%)", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "poly-line", type: "line", source: "poly",
        paint: { "line-color": "hsl(152 60% 50%)", "line-width": 2.5 },
      });
      map.addLayer({
        id: "poly-pts", type: "circle", source: "poly",
        filter: ["==", "$type", "Point"],
        paint: { "circle-radius": 5, "circle-color": "hsl(40 33% 97%)", "circle-stroke-color": "hsl(152 60% 38%)", "circle-stroke-width": 2 },
      });

      setReady(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current = []; };
  }, []);

  // click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const handler = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      if (drawMode) {
        polyRef.current = [...polyRef.current, [lng, lat]];
        onPolygonChange?.(polyRef.current);
      } else {
        onParcelSelect?.(lat, lng);
      }
    };
    map.on("click", handler);
    map.getCanvas().style.cursor = drawMode ? "crosshair" : "";
    return () => { map.off("click", handler); };
  }, [ready, drawMode, onParcelSelect, onPolygonChange]);

  // sync external polygon
  useEffect(() => { polyRef.current = drawnPolygon ?? []; }, [drawnPolygon]);

  // render polygon
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource("poly") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    const pts = drawnPolygon ?? [];
    const features: GeoJSON.Feature[] = pts.map((p, i) => ({
      type: "Feature", geometry: { type: "Point", coordinates: p }, properties: { i },
    }));
    if (pts.length >= 3) {
      features.push({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [[...pts, pts[0]]] },
        properties: {},
      });
    } else if (pts.length === 2) {
      features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: pts },
        properties: {},
      });
    }
    src.setData({ type: "FeatureCollection", features });
  }, [drawnPolygon, ready]);

  // selected marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (selectedMarkerRef.current) { selectedMarkerRef.current.remove(); selectedMarkerRef.current = null; }
    if (selected) {
      const el = document.createElement("div");
      el.style.cssText = "width:22px;height:22px;border-radius:50%;background:hsl(210 75% 48%);border:3px solid white;box-shadow:0 0 0 4px hsl(210 75% 48% / 0.3),0 4px 12px rgba(0,0,0,.4);";
      selectedMarkerRef.current = new Marker({ element: el }).setLngLat([selected.lng, selected.lat]).addTo(map);
      map.flyTo({ center: [selected.lng, selected.lat], zoom: Math.max(map.getZoom(), 11), duration: 1200 });
    }
  }, [selected, ready]);

  // heatmap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource("heat") as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    if (!activeLayer) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    // generate dense points around regions weighted by metric
    const features: GeoJSON.Feature[] = [];
    REGIONS.forEach((r) => {
      const v = activeLayer === "soil" ? r.soilDegradation
        : activeLayer === "health" ? r.healthRiskIndex
        : r.pesticideLevel === "high" ? 85 : r.pesticideLevel === "medium" ? 50 : 20;
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const radius = 0.15 + Math.random() * 0.45;
        features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.lng + Math.cos(angle) * radius, r.lat + Math.sin(angle) * radius] },
          properties: { v: v + (Math.random() - 0.5) * 20 },
        });
      }
    });
    src.setData({ type: "FeatureCollection", features });

    // recolor heatmap based on layer
    const ramp =
      activeLayer === "soil"
        ? ["interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)", 0.2, "hsla(35,92%,55%,0.4)", 0.6, "hsla(20,85%,55%,0.7)", 1, "hsla(0,72%,51%,0.85)"]
        : activeLayer === "health"
        ? ["interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)", 0.2, "hsla(0,72%,51%,0.3)", 0.6, "hsla(350,80%,50%,0.7)", 1, "hsla(340,90%,40%,0.9)"]
        : ["interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)", 0.2, "hsla(280,60%,55%,0.35)", 0.6, "hsla(290,70%,45%,0.7)", 1, "hsla(300,80%,35%,0.9)"];
    map.setPaintProperty("heat-layer", "heatmap-color", ramp as any);
  }, [activeLayer, ready]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
