import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Toilets Near Me NOW - Interactive Map | Find in Seconds',
  description:
    'Desperate for a loo? Find the nearest toilet instantly! Free interactive map with 18,000+ UK toilets. Filter: wheelchair, baby change, free. Updated daily.',
  keywords: [
    'toilets near me',
    'toilet near me',
    'public toilets near me',
    'public toilets close to me',
    'nearest toilet',
    'find toilet',
    'toilet map',
    'public loo near me',
    'restroom near me',
    'accessible toilets near me',
    'baby changing near me',
  ],
  openGraph: {
    title: 'Find Toilets Near Me - Interactive Map | Where To Wee',
    description: 'Find the nearest public toilets instantly. 18,000+ toilets across the UK with accessibility info, baby changing, and user ratings.',
    type: 'website',
    url: 'https://wheretowee.uk/map',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Toilets Near Me - Interactive Map',
    description: 'Find the nearest public toilets instantly with our free interactive map.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/map',
  },
};

// Dynamic import for the map component (client-side only)
const ToiletMap = dynamic(() => import('@/components/ToiletMap'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map Skeleton */}
      <div>
        <div className="mb-4 flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="w-full h-[400px] lg:h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Loading map...</p>
          </div>
        </div>
      </div>
      {/* List Skeleton */}
      <div>
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border-2 border-gray-100">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-8">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Toilets Near You</h1>
          <p className="text-emerald-100 text-lg">
            Locate the nearest public toilets with real-time distance information
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="container-custom py-8">
        <ToiletMap />
      </div>

      {/* Tips Section */}
      <div className="bg-white py-12 border-t">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Tips for Using Public Toilets
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">🆓</div>
              <h3 className="font-bold text-gray-800 mb-2">Look for Free Options</h3>
              <p className="text-gray-600 text-sm">
                Many supermarkets, libraries, and shopping centres offer free toilet access.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">♿</div>
              <h3 className="font-bold text-gray-800 mb-2">Accessible Facilities</h3>
              <p className="text-gray-600 text-sm">
                Filter by accessibility to find toilets with wheelchair access and support rails.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-3">👶</div>
              <h3 className="font-bold text-gray-800 mb-2">Baby Changing</h3>
              <p className="text-gray-600 text-sm">
                Parents can filter for baby changing facilities when out with little ones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
