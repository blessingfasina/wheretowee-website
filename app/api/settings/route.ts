import { NextResponse } from 'next/server';
import { getSiteSettings, isAppLaunched } from '@/lib/site-settings';

// Force dynamic - no caching so launch mode changes reflect immediately
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const launched = isAppLaunched(settings);

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(
      {
        launched,
        appStoreUrl: settings.app_store_url,
        playStoreUrl: settings.play_store_url,
        launchDate: settings.launch_date,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      launched: false,
      appStoreUrl: '',
      playStoreUrl: '',
      launchDate: null,
    });
  }
}
