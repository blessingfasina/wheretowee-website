import { supabase } from './supabase';

export interface SiteSettings {
  launch_mode: 'waitlist' | 'launched';
  app_store_url: string;
  play_store_url: string;
  launch_date: string | null;
}

const defaultSettings: SiteSettings = {
  launch_mode: 'waitlist',
  app_store_url: '',
  play_store_url: '',
  launch_date: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error || !data) {
      console.log('Using default settings');
      return defaultSettings;
    }

    return {
      launch_mode: data.launch_mode || 'waitlist',
      app_store_url: data.app_store_url || '',
      play_store_url: data.play_store_url || '',
      launch_date: data.launch_date || null,
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return defaultSettings;
  }
}

// Check if app is launched (either manually set or date passed)
export function isAppLaunched(settings: SiteSettings): boolean {
  // If manually set to launched, always return true
  if (settings.launch_mode === 'launched') {
    return true;
  }

  // If launch date is set and has passed, return true
  if (settings.launch_date) {
    const launchDate = new Date(settings.launch_date);
    const now = new Date();
    if (now >= launchDate) {
      return true;
    }
  }

  return false;
}
