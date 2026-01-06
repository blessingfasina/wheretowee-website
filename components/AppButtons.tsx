'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AppSettings {
  launched: boolean;
  appStoreUrl: string;
  playStoreUrl: string;
}

interface AppButtonsProps {
  variant?: 'primary' | 'secondary' | 'hero';
  showBothStores?: boolean;
  className?: string;
}

export default function AppButtons({ 
  variant = 'primary', 
  showBothStores = false,
  className = '' 
}: AppButtonsProps) {
  const [settings, setSettings] = useState<AppSettings>({
    launched: false,
    appStoreUrl: '',
    playStoreUrl: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Add cache-busting to ensure fresh data
        const res = await fetch('/api/settings', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Show nothing while loading to prevent flash
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 w-40 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  // WAITLIST MODE
  if (!settings.launched) {
    if (variant === 'hero') {
      return (
        <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
          <Link
            href="/download"
            className="btn btn-mint btn-lg text-center"
          >
            🔔 Join Waitlist
          </Link>
          <Link
            href="/map"
            className="btn btn-secondary btn-lg text-center"
          >
            🗺️ Try Web Map
          </Link>
        </div>
      );
    }

    return (
      <Link
        href="/download"
        className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
      >
        Join Waitlist
      </Link>
    );
  }

  // LAUNCHED MODE
  if (variant === 'hero' || showBothStores) {
    return (
      <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
        {settings.appStoreUrl && (
          <a
            href={settings.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg text-center"
          >
            🍎 Download for iPhone
          </a>
        )}
        {settings.playStoreUrl && (
          <a
            href={settings.playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-mint btn-lg text-center"
          >
            🤖 Download for Android
          </a>
        )}
        {!settings.appStoreUrl && !settings.playStoreUrl && (
          <Link
            href="/download"
            className="btn btn-primary btn-lg text-center"
          >
            📱 Download App
          </Link>
        )}
      </div>
    );
  }

  // Single button - link to download page with store options
  return (
    <Link
      href="/download"
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} ${className}`}
    >
      📱 Download App
    </Link>
  );
}

// Server component version that can be used in server components
export async function getAppButtonProps(): Promise<{
  launched: boolean;
  appStoreUrl: string;
  playStoreUrl: string;
}> {
  try {
    const { getSiteSettings, isAppLaunched } = await import('@/lib/site-settings');
    const settings = await getSiteSettings();
    return {
      launched: isAppLaunched(settings),
      appStoreUrl: settings.app_store_url,
      playStoreUrl: settings.play_store_url,
    };
  } catch {
    return {
      launched: false,
      appStoreUrl: '',
      playStoreUrl: '',
    };
  }
}
