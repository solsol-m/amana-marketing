'use client';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { MarketingData } from '../types/marketing';

type ProjectionType = 'geoEqualEarth' | 'geoMercator';

interface BubbleMapProps {
  marketingData: MarketingData | null;
  focusCenter?: [number, number];
  focusScale?: number;
  projection?: ProjectionType;
  backgroundFill?: string;
  labelColor?: string;
}

// Correct TopoJSON for react-simple-maps (contains objects.countries)
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COORDS: Record<string, { lat: number; lng: number }> = {
  Dubai: { lat: 25.276987, lng: 55.296249 },
  Sharjah: { lat: 25.346255, lng: 55.420932 },
  "Abu Dhabi": { lat: 24.453884, lng: 54.3773438 },
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Jeddah: { lat: 21.4858, lng: 39.1925 },
  Cairo: { lat: 30.0444, lng: 31.2357 },
  London: { lat: 51.5074, lng: -0.1278 },
  NewYork: { lat: 40.7128, lng: -74.006 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  // Gulf region cities
  Doha: { lat: 25.285447, lng: 51.53104 },
  Manama: { lat: 26.2235, lng: 50.5876 },
  Muscat: { lat: 23.588, lng: 58.3829 },
  "Kuwait City": { lat: 29.3759, lng: 47.9774 },
};

function colorForSpend(spend: number, maxSpend: number) {
  if (maxSpend <= 0) return '#60A5FA';
  const t = Math.min(1, spend / maxSpend);
  const r = Math.round(59 + t * (239 - 59));
  const g = Math.round(130 + t * (68 - 130));
  const b = Math.round(246 + t * (68 - 246));
  return `rgb(${r},${g},${b})`;
}

function radiusForRevenue(revenue: number, maxRevenue: number) {
  if (maxRevenue <= 0) return 4;
  const minR = 4;
  const maxR = 20;
  const t = Math.sqrt(Math.max(0, revenue) / maxRevenue);
  return minR + t * (maxR - minR);
}

export default function BubbleMap({ marketingData, focusCenter = [0, 5], focusScale = 175, projection = 'geoEqualEarth', backgroundFill = '#223042', labelColor = '#F3F4F6' }: BubbleMapProps) {
  const points = (() => {
    if (!marketingData) return [] as { key: string; name: string; coords: [number, number]; revenue: number; spend: number }[];
    const agg = new Map<string, { name: string; revenue: number; spend: number }>();
    marketingData.campaigns.forEach(c => {
      c.regional_performance.forEach(r => {
        const key = `${r.region}|${r.country}`;
        const cur = agg.get(key) || { name: r.region, revenue: 0, spend: 0 };
        cur.revenue += r.revenue;
        cur.spend += r.spend;
        agg.set(key, cur);
      });
    });
    const entries = Array.from(agg.entries()).map(([key, v]) => {
      const simpleKey = v.name.replace(/\s+/g, '');
      const coord = COORDS[v.name] || COORDS[simpleKey];
      if (!coord) return null;
      // react-simple-maps expects [longitude, latitude]
      return { key, name: v.name, coords: [coord.lng, coord.lat] as [number, number], revenue: v.revenue, spend: v.spend };
    }).filter(Boolean) as { key: string; name: string; coords: [number, number]; revenue: number; spend: number }[];
    return entries;
  })();

  const maxRevenue = points.reduce((m, p) => Math.max(m, p.revenue), 0);
  const maxSpend = points.reduce((m, p) => Math.max(m, p.spend), 0);

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-3">Regional Performance Map</h3>
      <div className="w-full h-[380px] sm:h-[420px] md:h-[520px]">
        <ComposableMap projection={projection} projectionConfig={{ scale: focusScale, center: focusCenter }} style={{ width: '100%', height: '100%' }}>
          <ZoomableGroup center={focusCenter} zoom={1} translateExtent={[[ -500, -300 ], [ 1500, 900 ]]}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography 
                    key={geo.rsmKey} 
                    geography={geo} 
                    stroke="#4B5563"
                    style={{ 
                      default: { fill: backgroundFill, outline: 'none' }, 
                      hover: { fill: '#1F2937', outline: 'none' }, 
                      pressed: { fill: '#1F2937', outline: 'none' } 
                    }} 
                  />
                ))
              }
            </Geographies>
            {points.map(p => (
              <Marker key={p.key} coordinates={p.coords}>
                <circle r={radiusForRevenue(p.revenue, maxRevenue)} fill={colorForSpend(p.spend, maxSpend)} fillOpacity={0.9} stroke="#0B1220" strokeWidth={1} />
                <text textAnchor="middle" y={-radiusForRevenue(p.revenue, maxRevenue) - 4} style={{ fontFamily: 'system-ui', fill: labelColor, fontSize: 11, paintOrder: 'stroke', stroke: '#0B1220', strokeWidth: 2 }}>{p.name}</text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-gray-300 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#3B82F6' }} />
          <span>Lower spend</span>
          <span className="inline-block w-3 h-3 rounded-full ml-3" style={{ background: '#EF4444' }} />
          <span>Higher spend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-400" />
          <span>Bubble size ~ revenue</span>
        </div>
      </div>
    </div>
  );
}
