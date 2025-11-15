import { NextRequest, NextResponse } from 'next/server';

// Minimal resilient mock that satisfies the UI needs (campaigns with weekly & regional performance)
const MOCK_MARKETING_DATA = {
  message: 'Mock fallback data',
  company_info: {
    name: 'Amana',
    founded: '2020-01-01',
    headquarters: 'Dubai, UAE',
    industry: 'E-commerce',
    description: 'Fallback dataset used when upstream API is unavailable.'
  },
  marketing_stats: {
    total_campaigns: 2,
    active_campaigns: 2,
    total_spend: 3500,
    total_revenue: 320000,
    total_conversions: 800,
    average_roas: 91.4,
    top_performing_medium: 'Instagram',
    top_performing_region: 'Dubai',
    total_impressions: 500000,
    total_clicks: 15000,
    average_ctr: 3.0,
    average_conversion_rate: 5.0
  },
  campaigns: [
    {
      id: 1,
      name: 'UAE Brand Awareness - IG',
      status: 'Active',
      objective: 'Awareness',
      medium: 'Instagram',
      format: 'Video',
      product_category: 'General',
      budget: 5000,
      spend: 2500,
      budget_utilization: 50,
      impressions: 300000,
      clicks: 9000,
      conversions: 600,
      revenue: 240000,
      average_order_value: 400,
      ctr: 3.0,
      conversion_rate: 6.7,
      cpc: 0.28,
      cpa: 4.17,
      roas: 96,
      target_demographics: { age_groups: ['18-24','25-34'], genders: ['Male','Female'], primary_device: 'Mobile' },
      demographic_breakdown: [],
      device_performance: [],
      weekly_performance: [
        { week_start: '2024-10-01', week_end: '2024-10-07', impressions: 40000, clicks: 1200, conversions: 70, spend: 250, revenue: 22000 },
        { week_start: '2024-10-08', week_end: '2024-10-14', impressions: 42000, clicks: 1300, conversions: 80, spend: 260, revenue: 23000 },
        { week_start: '2024-10-15', week_end: '2024-10-21', impressions: 45000, clicks: 1400, conversions: 90, spend: 270, revenue: 24000 }
      ],
      regional_performance: [
        { region: 'Dubai', country: 'UAE', impressions: 80000, clicks: 3000, conversions: 250, spend: 900, revenue: 90000, ctr: 3.75, conversion_rate: 8.3, cpc: 0.3, cpa: 3.6, roas: 100 },
        { region: 'Sharjah', country: 'UAE', impressions: 30000, clicks: 900, conversions: 60, spend: 300, revenue: 20000, ctr: 3.0, conversion_rate: 6.7, cpc: 0.33, cpa: 5, roas: 66 }
      ],
      creatives: [],
      timeline: { start_date: '2024-10-01', created_date: '2024-10-01', last_updated: '2024-12-01' },
      targeting: { regions: ['UAE'], interests: [], behaviors: [], custom_audiences: [] }
    },
    {
      id: 2,
      name: 'KSA Performance - Search',
      status: 'Active',
      objective: 'Conversions',
      medium: 'Google Ads',
      format: 'Search',
      product_category: 'General',
      budget: 4000,
      spend: 1000,
      budget_utilization: 25,
      impressions: 200000,
      clicks: 6000,
      conversions: 200,
      revenue: 80000,
      average_order_value: 400,
      ctr: 3.0,
      conversion_rate: 3.3,
      cpc: 0.17,
      cpa: 5,
      roas: 80,
      target_demographics: { age_groups: ['25-34','35-44'], genders: ['Male','Female'], primary_device: 'Mobile' },
      demographic_breakdown: [],
      device_performance: [],
      weekly_performance: [
        { week_start: '2024-10-01', week_end: '2024-10-07', impressions: 30000, clicks: 900, conversions: 30, spend: 120, revenue: 8000 },
        { week_start: '2024-10-08', week_end: '2024-10-14', impressions: 32000, clicks: 1000, conversions: 35, spend: 130, revenue: 9000 },
        { week_start: '2024-10-15', week_end: '2024-10-21', impressions: 35000, clicks: 1100, conversions: 40, spend: 140, revenue: 10000 }
      ],
      regional_performance: [
        { region: 'Riyadh', country: 'KSA', impressions: 60000, clicks: 2200, conversions: 80, spend: 300, revenue: 25000, ctr: 3.7, conversion_rate: 3.6, cpc: 0.14, cpa: 3.75, roas: 83 },
        { region: 'Kuwait City', country: 'Kuwait', impressions: 20000, clicks: 700, conversions: 25, spend: 150, revenue: 15000, ctr: 3.5, conversion_rate: 3.6, cpc: 0.21, cpa: 6, roas: 100 }
      ],
      creatives: [],
      timeline: { start_date: '2024-10-01', created_date: '2024-10-01', last_updated: '2024-12-01' },
      targeting: { regions: ['KSA','Kuwait'], interests: [], behaviors: [], custom_audiences: [] }
    }
  ],
  market_insights: {
    last_updated: '2024-12-01',
    peak_performance_day: 'Friday',
    peak_performance_time: '18:00',
    top_converting_product: 'Bundle A',
    fastest_growing_region: 'Dubai'
  },
  filters: {
    available_statuses: ['Active','Paused'],
    available_objectives: ['Awareness','Conversions'],
    available_mediums: ['Instagram','Google Ads'],
    available_formats: ['Video','Search'],
    available_product_categories: ['General'],
    available_regions: ['UAE','KSA','Kuwait'],
    applied: {}
  }
};

export async function GET(request: NextRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch('https://www.amanabootcamp.org/api/fs-classwork-data/amana-marketing', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control to prevent stale data
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers for local development
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching marketing data:', error);
    // Serve fallback so UI continues to work
    return NextResponse.json(MOCK_MARKETING_DATA, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'x-fallback': 'true'
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
