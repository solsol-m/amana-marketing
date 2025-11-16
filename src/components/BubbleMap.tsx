'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import type { MarketingData, RegionalPerformance } from '../types/marketing';

interface BubbleMapProps {
  marketingData: MarketingData | null;
}

const COORDS: Record<string, { lat: number; lng: number }> = {
  Dubai: { lat: 25.276987, lng: 55.296249 },
  Sharjah: { lat: 25.346255, lng: 55.420932 },
  'Abu Dhabi': { lat: 24.453884, lng: 54.3773438 },
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Jeddah: { lat: 21.4858, lng: 39.1925 },
  Cairo: { lat: 30.0444, lng: 31.2357 },
  Doha: { lat: 25.285447, lng: 51.53104 },
  Manama: { lat: 26.2235, lng: 50.5876 },
  Muscat: { lat: 23.588, lng: 58.3829 },
  'Kuwait City': { lat: 29.3759, lng: 47.9774 },
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
  if (maxRevenue <= 0) return 6;
  const minR = 6;
  const maxR = 24;
  const t = Math.sqrt(Math.max(0, revenue) / maxRevenue);
  return minR + t * (maxR - minR);
}

export default function BubbleMap({ marketingData }: BubbleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  const regions: RegionalPerformance[] | null = useMemo(() => {
    if (!marketingData) return null;
    // Prefer top-level data.region_performance if present
    const anyData: any = marketingData as any;
    if (anyData.region_performance && Array.isArray(anyData.region_performance)) {
      return anyData.region_performance as RegionalPerformance[];
    }
    // Fallback: aggregate from campaigns.regional_performance
    const map = new Map<string, RegionalPerformance>();
    marketingData.campaigns.forEach(c => {
      c.regional_performance.forEach(r => {
        const key = `${r.region}|${r.country}`;
        const cur = map.get(key) || { ...r, impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 };
        cur.impressions += r.impressions;
        cur.clicks += r.clicks;
        cur.conversions += r.conversions;
        cur.spend += r.spend;
        cur.revenue += r.revenue;
        map.set(key, cur);
      });
    });
    return Array.from(map.values());
  }, [marketingData]);

  const points = useMemo(() => {
    if (!regions) return [] as { key: string; name: string; lat: number; lng: number; revenue: number; spend: number }[];
    return regions
      .map(r => {
        const coord = COORDS[r.region] || COORDS[r.region.replace(/\s+/g, '')] || COORDS[r.country];
        if (!coord) return null;
        return { key: `${r.region}|${r.country}`, name: r.region, lat: coord.lat, lng: coord.lng, revenue: r.revenue, spend: r.spend };
      })
      .filter(Boolean) as { key: string; name: string; lat: number; lng: number; revenue: number; spend: number }[];
  }, [regions]);

  const maxRevenue = points.reduce((m, p) => Math.max(m, p.revenue), 0);
  const maxSpend = points.reduce((m, p) => Math.max(m, p.spend), 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !mapRef.current || leafletMapRef.current) {
      return;
    }

    // Add delay for Vercel deployment
    const timer = setTimeout(() => {
      // Dynamic import of Leaflet to avoid SSR issues
      import('leaflet').then((L) => {
        if (!mapRef.current || leafletMapRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current, {
          center: [25, 50],
          zoom: 5,
          scrollWheelZoom: false
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        leafletMapRef.current = map;

        // Force map resize after initialization
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }, 100);

        // Add markers when data is available
        if (points.length > 0) {
          points.forEach(p => {
            const radius = radiusForRevenue(p.revenue, maxRevenue);
            const color = colorForSpend(p.spend, maxSpend);
            
            const circle = L.circleMarker([p.lat, p.lng], {
              radius: radius,
              fillColor: color,
              color: '#0B1220',
              weight: 1,
              fillOpacity: 0.9
            }).addTo(map);

            // Add tooltip
            circle.bindTooltip(`
              <div style="font-size: 12px; font-weight: 500;">${p.name}</div>
              <div style="font-size: 11px;">Revenue: $${Math.round(p.revenue).toLocaleString()}</div>
              <div style="font-size: 11px;">Spend: $${Math.round(p.spend).toLocaleString()}</div>
            `, {
              permanent: false,
              direction: 'top',
              className: 'custom-tooltip'
            });

            // Add permanent label
            L.marker([p.lat, p.lng], {
              icon: L.divIcon({
                className: 'custom-label',
                html: `<div style="color: #F3F4F6; font-size: 11px; font-weight: 500; text-shadow: 1px 1px 2px #0B1220; white-space: nowrap; transform: translate(-50%, ${-radius - 20}px);">${p.name}</div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
              })
            }).addTo(map);
          });
        }
      }).catch(error => {
        console.error('Failed to load Leaflet:', error);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mounted, points, maxRevenue, maxSpend]);

  if (!mounted) {
    return (
      <div className="w-full bg-gray-800 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">Regional Performance Map</h3>
        <div className="w-full h-[380px] sm:h-[420px] md:h-[520px] bg-gray-700/40 rounded flex items-center justify-center">
          <div className="text-gray-400">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-3">Regional Performance Map</h3>
      <div 
        ref={mapRef}
        className="w-full h-[380px] sm:h-[420px] md:h-[520px] overflow-hidden rounded"
        style={{ background: '#1F2937' }}
      />
      <style jsx>{`
        :global(.custom-tooltip) {
          background: #374151 !important;
          border: 1px solid #4B5563 !important;
          border-radius: 8px !important;
          color: #E5E7EB !important;
          padding: 8px !important;
        }
        :global(.custom-label) {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
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
