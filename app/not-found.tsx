import Link from 'next/link';
import { Home, MapPin, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl mb-6">🚽</div>
        <h1 className="text-4xl font-bold text-navy-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Oops! Looks like this page has gone missing. Don't worry, we'll help you find your way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link href="/map" className="btn btn-secondary">
            <MapPin className="w-5 h-5" />
            Find Toilets
          </Link>
        </div>
      </div>
    </div>
  );
}

