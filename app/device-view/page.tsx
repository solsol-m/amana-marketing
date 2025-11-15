'use client';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { DollarSign, Smartphone, MonitorSmartphone, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const deviceData = {
  device_performance: [
    {
      device: 'Mobile',
      impressions: 183236,
      clicks: 6329,
      conversions: 587,
      spend: 2723.29,
      revenue: 255714,
      ctr: 3.45,
      conversion_rate: 9.27,
      percentage_of_traffic: 75,
    },
    {
      device: 'Desktop',
      impressions: 48863,
      clicks: 1688,
      conversions: 156,
      spend: 726.21,
      revenue: 68190.4,
      ctr: 3.45,
      conversion_rate: 9.24,
      percentage_of_traffic: 25,
    },
  ],
};

export default function DeviceView() {
  const mobile = deviceData.device_performance.find(d => d.device === 'Mobile')!;
  const desktop = deviceData.device_performance.find(d => d.device === 'Desktop')!;

  const chartData = deviceData.device_performance.map(d => ({
    device: d.device,
    revenue: d.revenue,
    spend: d.spend,
  }));

  const formatCurrency = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">Device View</h1>
              <p className="text-gray-300 mt-2">Comparing Mobile vs Desktop performance</p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto w-full max-w-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Mobile</h3>
                <Smartphone className="h-5 w-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-white">
                <CardMetric title="Revenue" value={formatCurrency(mobile.revenue)} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Spend" value={formatCurrency(mobile.spend)} />
                <CardMetric title="Impressions" value={mobile.impressions} />
                <CardMetric title="Clicks" value={mobile.clicks} />
                <CardMetric title="Conversions" value={mobile.conversions} />
                <CardMetric title="Conv. Rate" value={`${mobile.conversion_rate}%`} />
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Desktop</h3>
                <MonitorSmartphone className="h-5 w-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-white">
                <CardMetric title="Revenue" value={formatCurrency(desktop.revenue)} icon={<DollarSign className="h-5 w-5" />} />
                <CardMetric title="Spend" value={formatCurrency(desktop.spend)} />
                <CardMetric title="Impressions" value={desktop.impressions} />
                <CardMetric title="Clicks" value={desktop.clicks} />
                <CardMetric title="Conversions" value={desktop.conversions} />
                <CardMetric title="Conv. Rate" value={`${desktop.conversion_rate}%`} />
              </div>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Revenue vs Spend by Device</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="device" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    cursor={{ fill: 'transparent', stroke: '#4B5563', strokeWidth: 1 }}
                    formatter={(value: any, name: string) => {
                      const formatted = formatCurrency(value as number);
                      const label = name === 'revenue' ? 'Revenue' : name === 'spend' ? 'Spend' : name;
                      return [formatted, label];
                    }}
                    contentStyle={{ backgroundColor: '#374151', border: '1px solid #4B5563', borderRadius: 8, color: '#E5E7EB' }}
                    labelStyle={{ color: '#D1D5DB' }}
                  />
                  <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4,4,0,0]} />
                  <Bar dataKey="spend" name="Spend" fill="#3B82F6" radius={[4,4,0,0]} />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
