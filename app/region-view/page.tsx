"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import BubbleMap from '../../src/components/BubbleMap';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData } from '../../src/types/marketing';

export default function RegionView() {
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
                Region View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center text-gray-300">Loading...</div>
          ) : error ? (
            <div className="h-[500px] flex items-center justify-center text-red-300">{error}</div>
          ) : (
            <BubbleMap 
              marketingData={marketingData}
              projection="geoMercator"
              focusCenter={[50, 25]}
              focusScale={1100}
              backgroundFill="#1F2937"
              labelColor="#F9FAFB"
            />
          )}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
