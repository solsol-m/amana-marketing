"use client";
import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function WeeklyView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const weeklySeries = useMemo(() => {
    if (!marketingData) return [] as { week_start: string; revenue: number; spend: number }[];
    const map = new Map<string, { week_start: string; revenue: number; spend: number }>();
    marketingData.campaigns.forEach(c => {
      c.weekly_performance.forEach(w => {
        const key = w.week_start;
        const existing = map.get(key) || { week_start: key, revenue: 0, spend: 0 };
        existing.revenue += w.revenue;
        existing.spend += w.spend;
        map.set(key, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.week_start).getTime() - new Date(b.week_start).getTime());
  }, [marketingData]);

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Page content will go here */}
          <div className="rounded-lg p-4 bg-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Performance: Revenue vs Spend</h3>
            <div className="h-96">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-300">Loading...</div>
              ) : error ? (
                <div className="h-full flex items-center justify-center text-red-300">{error}</div>
              ) : weeklySeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-300">No weekly data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklySeries} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week_start" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <Tooltip 
                      cursor={{ stroke: '#4B5563', strokeWidth: 1, fill: 'transparent' }}
                      formatter={(value: any, name: string) => {
                        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value as number);
                        const label = name === 'revenue' ? 'Revenue' : name === 'spend' ? 'Spend' : name;
                        return [formatted, label];
                      }}
                      contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: 8, color: '#E5E7EB' }}
                      labelStyle={{ color: '#D1D5DB' }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="spend" name="Spend" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
