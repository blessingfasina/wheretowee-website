import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Toilet {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  fee: string | null;
  wheelchair: string | null;
  baby_changing: string | null;
  unisex: string | null;
  opening_hours: string | null;
  operator_name: string | null;
  average_rating: number | null;
  rating_count: number | null;
  status: string;
  created_at: string;
}

export async function getNearbyToilets(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 50
): Promise<Toilet[]> {
  // Simple bounding box query
  const latDiff = radiusKm / 111;
  const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .or('status.eq.active,status.eq.approved')
    .gte('latitude', lat - latDiff)
    .lte('latitude', lat + latDiff)
    .gte('longitude', lng - lngDiff)
    .lte('longitude', lng + lngDiff)
    .limit(limit);

  if (error) {
    console.error('Error fetching toilets:', error);
    return [];
  }

  return data || [];
}

export async function getToiletsByCity(city: string, limit: number = 100): Promise<Toilet[]> {
  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .or('status.eq.active,status.eq.approved')
    .ilike('address', `%${city}%`)
    .limit(limit);

  if (error) {
    console.error('Error fetching toilets:', error);
    return [];
  }

  return data || [];
}

export async function getToiletById(id: number): Promise<Toilet | null> {
  const { data, error } = await supabase
    .from('toilets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching toilet:', error);
    return null;
  }

  return data;
}

export async function getToiletStats(): Promise<{
  total: number;
  accessible: number;
  babyChanging: number;
  free: number;
}> {
  const { count: total } = await supabase
    .from('toilets')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved');

  const { count: accessible } = await supabase
    .from('toilets')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('wheelchair', 'yes');

  const { count: babyChanging } = await supabase
    .from('toilets')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('baby_changing', 'yes');

  const { count: free } = await supabase
    .from('toilets')
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .or('fee.eq.no,fee.eq.free');

  return {
    total: total || 0,
    accessible: accessible || 0,
    babyChanging: babyChanging || 0,
    free: free || 0,
  };
}

export async function getCities(): Promise<string[]> {
  // Major UK cities for directory
  return [
    'London',
    'Birmingham',
    'Manchester',
    'Leeds',
    'Glasgow',
    'Liverpool',
    'Bristol',
    'Sheffield',
    'Edinburgh',
    'Leicester',
    'Coventry',
    'Bradford',
    'Cardiff',
    'Belfast',
    'Nottingham',
    'Newcastle',
    'Brighton',
    'Southampton',
    'Portsmouth',
    'Oxford',
    'Cambridge',
    'York',
    'Bath',
    'Bournemouth',
  ];
}

