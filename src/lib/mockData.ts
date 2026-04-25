// Realistic mock data for Tunisian agricultural regions
export interface Region {
  id: string;
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
  soilDegradation: number; // 20-75%
  healthRiskIndex: number; // 10-90
  pesticideLevel: 'low' | 'medium' | 'high';
  yield: number; // 1-5 tons/ha
  hectares: number;
  primaryCrop: string;
}

export const REGIONS: Region[] = [
  { id: 'kairouan', name: 'Kairouan', nameAr: 'القيروان', lat: 35.6781, lng: 10.0963, soilDegradation: 58, healthRiskIndex: 64, pesticideLevel: 'high', yield: 2.1, hectares: 124500, primaryCrop: 'Cereals' },
  { id: 'sfax', name: 'Sfax', nameAr: 'صفاقس', lat: 34.7406, lng: 10.7603, soilDegradation: 42, healthRiskIndex: 55, pesticideLevel: 'medium', yield: 3.4, hectares: 198000, primaryCrop: 'Olives' },
  { id: 'gabes', name: 'Gabès', nameAr: 'قابس', lat: 33.8815, lng: 10.0982, soilDegradation: 71, healthRiskIndex: 82, pesticideLevel: 'high', yield: 1.6, hectares: 78000, primaryCrop: 'Date palms' },
  { id: 'nabeul', name: 'Nabeul', nameAr: 'نابل', lat: 36.4513, lng: 10.7357, soilDegradation: 28, healthRiskIndex: 31, pesticideLevel: 'medium', yield: 4.2, hectares: 88500, primaryCrop: 'Citrus' },
  { id: 'beja', name: 'Béja', nameAr: 'باجة', lat: 36.7256, lng: 9.1817, soilDegradation: 24, healthRiskIndex: 22, pesticideLevel: 'low', yield: 4.7, hectares: 142000, primaryCrop: 'Wheat' },
  { id: 'kef', name: 'Le Kef', nameAr: 'الكاف', lat: 36.1675, lng: 8.7048, soilDegradation: 33, healthRiskIndex: 38, pesticideLevel: 'low', yield: 3.9, hectares: 96000, primaryCrop: 'Barley' },
  { id: 'gafsa', name: 'Gafsa', nameAr: 'قفصة', lat: 34.4225, lng: 8.7842, soilDegradation: 68, healthRiskIndex: 76, pesticideLevel: 'high', yield: 1.4, hectares: 52000, primaryCrop: 'Olives' },
  { id: 'sidi-bouzid', name: 'Sidi Bouzid', nameAr: 'سيدي بوزيد', lat: 35.0382, lng: 9.4858, soilDegradation: 51, healthRiskIndex: 59, pesticideLevel: 'high', yield: 2.6, hectares: 168000, primaryCrop: 'Tomatoes' },
  { id: 'mahdia', name: 'Mahdia', nameAr: 'المهدية', lat: 35.5047, lng: 11.0622, soilDegradation: 39, healthRiskIndex: 44, pesticideLevel: 'medium', yield: 3.6, hectares: 71000, primaryCrop: 'Olives' },
  { id: 'bizerte', name: 'Bizerte', nameAr: 'بنزرت', lat: 37.2746, lng: 9.8739, soilDegradation: 26, healthRiskIndex: 28, pesticideLevel: 'low', yield: 4.5, hectares: 115000, primaryCrop: 'Cereals' },
];

export const TUNISIA_CENTER: [number, number] = [9.5375, 33.8869];
export const TUNISIA_BOUNDS: [[number, number], [number, number]] = [[7.5, 30.2], [11.6, 37.6]];

// Deterministic pseudo-random based on coordinates
function hashCoord(lat: number, lng: number, salt = 0): number {
  const x = Math.sin(lat * 12.9898 + lng * 78.233 + salt * 43.758) * 43758.5453;
  return x - Math.floor(x);
}

export interface ParcelAnalysis {
  lat: number;
  lng: number;
  region: string;
  soilQuality: number;
  salinity: number;
  moisture: number;
  contamination: number;
  expectedYield: number;
  ph: number;
  organicMatter: number;
  nitrogen: number;
}

export function analyzeParcel(lat: number, lng: number): ParcelAnalysis {
  // find nearest region for context
  const nearest = REGIONS.reduce((best, r) => {
    const d = Math.hypot(r.lat - lat, r.lng - lng);
    return d < best.d ? { d, r } : best;
  }, { d: Infinity, r: REGIONS[0] }).r;

  const base = nearest.soilDegradation;
  const variance = (hashCoord(lat, lng) - 0.5) * 30;
  const soilQuality = Math.max(15, Math.min(95, 100 - base + variance));

  return {
    lat, lng,
    region: nearest.name,
    soilQuality: Math.round(soilQuality),
    salinity: Math.round(20 + hashCoord(lat, lng, 1) * 60),
    moisture: Math.round(15 + hashCoord(lat, lng, 2) * 70),
    contamination: Math.round(nearest.healthRiskIndex * 0.7 + hashCoord(lat, lng, 3) * 30),
    expectedYield: +(nearest.yield + (hashCoord(lat, lng, 4) - 0.5) * 1.5).toFixed(2),
    ph: +(6.2 + hashCoord(lat, lng, 5) * 2.4).toFixed(1),
    organicMatter: +(0.8 + hashCoord(lat, lng, 6) * 3.2).toFixed(2),
    nitrogen: Math.round(20 + hashCoord(lat, lng, 7) * 80),
  };
}

export interface SimulationPoint { year: string; value: number; }
export interface ScenarioResult {
  id: string; name: string; description: string;
  economic: SimulationPoint[];
  health: SimulationPoint[];
  cost: number;
  netGain: number;
}

export function buildScenarios(): ScenarioResult[] {
  const years = ['2025', '2026', '2027', '2028', '2029'];
  return [
    {
      id: 'none', name: 'No intervention',
      description: 'Continue current practices. Soil continues degrading.',
      economic: years.map((y, i) => ({ year: y, value: 12500 - i * 1100 })),
      health: years.map((y, i) => ({ year: y, value: 58 + i * 5.2 })),
      cost: 0, netGain: -8400,
    },
    {
      id: 'remediation', name: 'Soil remediation',
      description: 'Bio-remediation, organic matter restoration, reduced tillage.',
      economic: years.map((y, i) => ({ year: y, value: 12500 + i * 1450 })),
      health: years.map((y, i) => ({ year: y, value: 58 - i * 6.8 })),
      cost: 4200, netGain: 18600,
    },
    {
      id: 'crop-switch', name: 'Crop switching',
      description: 'Transition to drought-resistant, low-input crops.',
      economic: years.map((y, i) => ({ year: y, value: 11000 + i * 1850 })),
      health: years.map((y, i) => ({ year: y, value: 58 - i * 4.5 })),
      cost: 2800, netGain: 14200,
    },
  ];
}

export interface Insight {
  id: string;
  title: string;
  category: 'soil' | 'pesticide' | 'crop' | 'water';
  economicImpact: string;
  healthImpact: string;
  cost: string;
  priority: 'critical' | 'high' | 'medium';
  description: string;
}

export const INSIGHTS: Insight[] = [
  { id: '1', title: 'Reduce pesticide intensity in Kairouan', category: 'pesticide', economicImpact: '+€2,400/ha/yr', healthImpact: '−38% exposure risk', cost: '€680/ha', priority: 'critical', description: 'Current pesticide loads exceed safe thresholds by 2.3×. Switch to integrated pest management.' },
  { id: '2', title: 'Bio-remediate degraded soils in Gabès', category: 'soil', economicImpact: '+€3,100/ha/yr', healthImpact: '−24% contamination', cost: '€4,200/ha', priority: 'critical', description: 'Salinity-tolerant cover crops + organic amendments restore productivity within 18 months.' },
  { id: '3', title: 'Switch to drought-resistant cereals — Sidi Bouzid', category: 'crop', economicImpact: '+€1,850/ha/yr', healthImpact: '−12% water risk', cost: '€2,800/ha', priority: 'high', description: 'Replace water-intensive tomatoes with quinoa and barley varieties adapted to semi-arid climate.' },
  { id: '4', title: 'Drip irrigation expansion — Sfax olive groves', category: 'water', economicImpact: '+€1,200/ha/yr', healthImpact: 'Neutral', cost: '€1,950/ha', priority: 'high', description: 'Reduce water consumption 42% while increasing olive yield through precision drip systems.' },
  { id: '5', title: 'Organic matter restoration — Gafsa', category: 'soil', economicImpact: '+€980/ha/yr', healthImpact: '−18% contamination', cost: '€1,400/ha', priority: 'medium', description: 'Compost integration over 3 seasons rebuilds soil organic carbon from 0.9% to 2.4%.' },
  { id: '6', title: 'Crop rotation diversification — Béja', category: 'crop', economicImpact: '+€720/ha/yr', healthImpact: '−8% soil-borne risk', cost: '€340/ha', priority: 'medium', description: 'Introduce legume rotation to fix nitrogen and break pest cycles. Low-cost, high-return.' },
];

export const RECENT_ANALYSES = [
  { id: 'a1', parcel: 'Parcel KR-2841', region: 'Kairouan', score: 42, date: '2h ago', status: 'risk' },
  { id: 'a2', parcel: 'Parcel BJ-1102', region: 'Béja', score: 81, date: '5h ago', status: 'good' },
  { id: 'a3', parcel: 'Parcel SF-0938', region: 'Sfax', score: 64, date: '1d ago', status: 'moderate' },
  { id: 'a4', parcel: 'Parcel GB-0412', region: 'Gabès', score: 28, date: '1d ago', status: 'risk' },
  { id: 'a5', parcel: 'Parcel NB-3301', region: 'Nabeul', score: 76, date: '2d ago', status: 'good' },
];
