'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MarketingData } from '../types/marketing';

interface AgeBarChartProps {
  marketingData: MarketingData | null;
}

interface AgeGroupData {
  ageGroup: string;
  spend: number;
  revenue: number;
}

export default function AgeBarChart({ marketingData }: AgeBarChartProps) {
  const calculateAgeGroupMetrics = (): AgeGroupData[] => {
    if (!marketingData) return [];

    const ageGroupMap = new Map<string, { spend: number; revenue: number; impressions: number; totalImpressions: number }>();

    // Process all campaigns to aggregate data by age group
    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(demo => {
        const ageGroup = demo.age_group;
        if (!ageGroupMap.has(ageGroup)) {
          ageGroupMap.set(ageGroup, { spend: 0, revenue: 0, impressions: 0, totalImpressions: 0 });
        }
        
        const data = ageGroupMap.get(ageGroup)!;
        data.impressions += demo.performance.impressions;
      });
    });

    // Calculate total impressions for each age group across all campaigns
    const totalImpressionsByAgeGroup = new Map<string, number>();
    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(demo => {
        const current = totalImpressionsByAgeGroup.get(demo.age_group) || 0;
        totalImpressionsByAgeGroup.set(demo.age_group, current + demo.performance.impressions);
      });
    });

    // Calculate proportional spend and revenue for each age group
    const result: AgeGroupData[] = [];
    ageGroupMap.forEach((data, ageGroup) => {
      const totalImpressions = totalImpressionsByAgeGroup.get(ageGroup) || 0;
      const totalCampaignSpend = marketingData.campaigns.reduce((sum, c) => sum + c.spend, 0);
      const totalCampaignRevenue = marketingData.campaigns.reduce((sum, c) => sum + c.revenue, 0);
      const totalAllImpressions = marketingData.campaigns.reduce((sum, c) => sum + c.impressions, 0);

      // Calculate proportional spend and revenue based on impression share
      const impressionShare = totalAllImpressions > 0 ? totalImpressions / totalAllImpressions : 0;
      const spend = totalCampaignSpend * impressionShare;
      const revenue = totalCampaignRevenue * impressionShare;

      result.push({
        ageGroup,
        spend: Math.round(spend),
        revenue: Math.round(revenue)
      });
    });

    // Sort by age group for consistent display
    return result.sort((a, b) => a.ageGroup.localeCompare(b.ageGroup));
  };

  const chartData = calculateAgeGroupMetrics();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-200 font-medium">{`Age Group: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'spend' ? 'Spend' : 'Revenue'}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!marketingData || chartData.length === 0) {
    return (
      <div className="rounded-lg p-6 text-center">
        <p className="text-gray-400">No age group data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Spend & Revenue by Age Group</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="ageGroup" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
              iconType="rect"
            />
            <Bar 
              dataKey="spend" 
              fill="#3B82F6" 
              name="Total Spend"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="revenue" 
              fill="#10B981" 
              name="Total Revenue"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}