import { NextResponse } from 'next/server';
import { getSiteSettings, isAppLaunched } from '@/lib/site-settings';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const settings = await getSiteSettings();
    const launched = isAppLaunched(settings);

    return NextResponse.json({
      launched,
      appStoreUrl: settings.app_store_url,
      playStoreUrl: settings.play_store_url,
      launchDate: settings.launch_date,
    });
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
