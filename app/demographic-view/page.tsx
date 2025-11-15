"use client";
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Footer } from '../../src/components/ui/footer';
import { Users, UserCheck, TrendingUp, Target, DollarSign } from 'lucide-react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';
import { useState, useEffect } from 'react';
import AgeBarChart from '../../src/components/AgeBarChart';
import { Table } from '../../src/components/ui/table';

export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading marketing data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate demographic metrics
  const calculateDemographicMetrics = () => {
    if (!marketingData) return { male: null, female: null };

    const campaigns = marketingData.campaigns;
    let totalMaleClicks = 0;
    let totalMaleImpressions = 0;
    let totalMaleConversions = 0;
    let totalMaleAudiencePercentage = 0;
    let maleCount = 0;

    let totalFemaleClicks = 0;
    let totalFemaleImpressions = 0;
    let totalFemaleConversions = 0;
    let totalFemaleAudiencePercentage = 0;
    let femaleCount = 0;

    campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(demo => {
        if (demo.gender === 'Male') {
          totalMaleClicks += demo.performance.clicks;
          totalMaleImpressions += demo.performance.impressions;
          totalMaleConversions += demo.performance.conversions;
          totalMaleAudiencePercentage += demo.percentage_of_audience;
          maleCount++;
        } else if (demo.gender === 'Female') {
          totalFemaleClicks += demo.performance.clicks;
          totalFemaleImpressions += demo.performance.impressions;
          totalFemaleConversions += demo.performance.conversions;
          totalFemaleAudiencePercentage += demo.percentage_of_audience;
          femaleCount++;
        }
      });
    });

    // Calculate average audience percentages
    const avgMaleAudiencePercentage = maleCount > 0 ? totalMaleAudiencePercentage / maleCount : 0;
    const avgFemaleAudiencePercentage = femaleCount > 0 ? totalFemaleAudiencePercentage / femaleCount : 0;

    // Calculate proportional spend and revenue based on total campaign data
    const totalCampaignSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalCampaignRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

    const totalAudiencePercentage = avgMaleAudiencePercentage + avgFemaleAudiencePercentage;
    
    const maleSpend = totalAudiencePercentage > 0 ? (avgMaleAudiencePercentage / totalAudiencePercentage) * totalCampaignSpend : 0;
    const maleRevenue = totalAudiencePercentage > 0 ? (avgMaleAudiencePercentage / totalAudiencePercentage) * totalCampaignRevenue : 0;
    
    const femaleSpend = totalAudiencePercentage > 0 ? (avgFemaleAudiencePercentage / totalAudiencePercentage) * totalCampaignSpend : 0;
    const femaleRevenue = totalAudiencePercentage > 0 ? (avgFemaleAudiencePercentage / totalAudiencePercentage) * totalCampaignRevenue : 0;

    return {
      male: {
        clicks: totalMaleClicks,
        spend: maleSpend,
        revenue: maleRevenue,
        impressions: totalMaleImpressions,
        conversions: totalMaleConversions
      },
      female: {
        clicks: totalFemaleClicks,
        spend: femaleSpend,
        revenue: femaleRevenue,
        impressions: totalFemaleImpressions,
        conversions: totalFemaleConversions
      }
    };
  };

  const metrics = calculateDemographicMetrics();

  // Build gender-by-age performance rows
  const buildGenderAgeRows = (gender: 'Male' | 'Female') => {
    if (!marketingData) return [] as Array<{
      ageGroup: string;
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
    }>;

    const aggregate = new Map<string, { impressions: number; clicks: number; conversions: number }>();

    marketingData.campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(demo => {
        if (demo.gender !== gender) return;
        const key = demo.age_group;
        if (!aggregate.has(key)) {
          aggregate.set(key, { impressions: 0, clicks: 0, conversions: 0 });
        }
        const acc = aggregate.get(key)!;
        acc.impressions += demo.performance.impressions;
        acc.clicks += demo.performance.clicks;
        acc.conversions += demo.performance.conversions;
      });
    });

    return Array.from(aggregate.entries())
      .map(([ageGroup, acc]) => {
        const ctr = acc.impressions > 0 ? (acc.clicks / acc.impressions) * 100 : 0;
        const conversionRate = acc.clicks > 0 ? (acc.conversions / acc.clicks) * 100 : 0;
        return {
          ageGroup,
          impressions: acc.impressions,
          clicks: acc.clicks,
          conversions: acc.conversions,
          ctr,
          conversionRate,
        };
      })
      .sort((a, b) => a.ageGroup.localeCompare(b.ageGroup));
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Loading demographic data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded max-w-md mx-auto">
            Error loading data: {error}
          </div>
        </div>
      </div>
    );
  }

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
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <CardMetric
              title="Total Clicks (Male)"
              value={metrics.male?.clicks || 0}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <CardMetric
              title="Total Spend (Male)"
              value={`$${Math.round(metrics.male?.spend || 0).toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <CardMetric
              title="Total Revenue (Male)"
              value={`$${Math.round(metrics.male?.revenue || 0).toLocaleString()}`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <CardMetric
              title="Total Clicks (Female)"
              value={metrics.female?.clicks || 0}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <CardMetric
              title="Total Spend (Female)"
              value={`$${Math.round(metrics.female?.spend || 0).toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <CardMetric
              title="Total Revenue (Female)"
              value={`$${Math.round(metrics.female?.revenue || 0).toLocaleString()}`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
          
          {/* Age Group Bar Chart */}
          <div className="mt-8">
            <AgeBarChart marketingData={marketingData} />
          </div>

          {/* Gender Performance Tables */}
          <div className="mt-10 space-y-6">
            <Table
              title="Male Campaigns"
              maxHeight="360px"
              columns={[
                { key: 'ageGroup', header: 'Age Group', width: '18%', sortable: true, sortType: 'string' },
                { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'ctr', header: 'CTR', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
                { key: 'conversionRate', header: 'Conversion Rate', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
              ]}
              data={buildGenderAgeRows('Male')}
            />

            <Table
              title="Female Campaigns"
              maxHeight="360px"
              columns={[
                { key: 'ageGroup', header: 'Age Group', width: '18%', sortable: true, sortType: 'string' },
                { key: 'impressions', header: 'Impressions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'clicks', header: 'Clicks', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'conversions', header: 'Conversions', align: 'right', sortable: true, sortType: 'number', render: (v) => v.toLocaleString() },
                { key: 'ctr', header: 'CTR', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
                { key: 'conversionRate', header: 'Conversion Rate', align: 'right', sortable: true, sortType: 'number', render: (v) => `${v.toFixed(2)}%` },
              ]}
              data={buildGenderAgeRows('Female')}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
