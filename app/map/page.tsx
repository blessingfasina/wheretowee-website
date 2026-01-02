import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { MapPin, Filter, Navigation } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Public Toilets Near Me - Interactive Map',
  description:
    'Use our interactive map to find public toilets near your current location. Filter by accessibility, baby changing, and more.',
  openGraph: {
    title: 'Find Public Toilets Near Me - Where To Wee',
    description: 'Interactive map to find public toilets near you across the UK.',
  },
};

// Dynamic import for the map component (client-side only)
const ToiletMap = dynamic(() => import('@/components/ToiletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-80px)] bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-mint-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="relative">
      {/* Map Info Bar */}
      <div className="bg-navy-600 text-white py-3 px-4">
        <div className="container-custom">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Find Toilets Near You</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-mint-500 rounded-full" />
                Free
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-coral-500 rounded-full" />
                Paid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                Accessible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <ToiletMap />

      {/* Download Prompt */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-lg p-4 z-[1000]">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div>
            <h3 className="font-bold text-navy-800">Get the App</h3>
            <p className="text-sm text-gray-600 mb-2">
              Download for a better experience with offline access and notifications.
            </p>
            <a
              href="/download"
              className="text-mint-600 font-semibold text-sm hover:text-mint-700"
            >
              Download Free →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

