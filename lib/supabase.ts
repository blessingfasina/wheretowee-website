import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base toilet interface (works with both v1 and v2)
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
  // V2 additional fields (optional for backward compatibility)
  original_id?: string;
  radar_key?: string | null;
  men?: string | null;
  women?: string | null;
  attended?: string | null;
  automatic?: string | null;
  urinal_only?: string | null;
  children?: string | null;
  notes?: string | null;
  payment_details?: string | null;
  verified_at?: string | null;
}

// Cache for active table name (to avoid repeated DB calls)
let cachedTableName: string | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get the active toilet table name from app_settings
 * Defaults to 'toilets' if setting not found
 */
export async function getActiveToiletTable(): Promise<string> {
  // Return cached value if still valid
  if (cachedTableName && Date.now() < cacheExpiry) {
    return cachedTableName;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'website_toilet_table')
      .single();

    if (!error && data && data.setting_value) {
      cachedTableName = data.setting_value as string;
      cacheExpiry = Date.now() + CACHE_DURATION;
      return cachedTableName;
    }
  } catch (e) {
    console.log('Could not fetch app_settings, using default table');
  }

  // Default to original table
  cachedTableName = 'toilets';
  cacheExpiry = Date.now() + CACHE_DURATION;
  return 'toilets';
}

/**
 * Get the appropriate RPC function name based on table
 */
function getRpcFunctionName(tableName: string): string {
  return tableName === 'toilets_v2' ? 'find_nearby_toilets_v2' : 'find_nearby_toilets';
}

/**
 * Force refresh the cached table name
 */
export function invalidateTableCache(): void {
  cachedTableName = null;
  cacheExpiry = 0;
}

export async function getNearbyToilets(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 50
): Promise<Toilet[]> {
  const tableName = await getActiveToiletTable();
  const rpcFunction = getRpcFunctionName(tableName);

  // Try RPC function first for accurate distance-based results
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(rpcFunction, {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radiusKm * 1000, // Convert km to meters
      max_results: limit,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData as Toilet[];
    }
    
    // If RPC returns empty or fails, fall back to bounding box
    console.log(`RPC (${rpcFunction}) returned empty, falling back to bounding box query`);
  } catch (rpcErr) {
    console.log(`RPC function (${rpcFunction}) failed, using fallback:`, rpcErr);
  }

  // Fallback: Simple bounding box query
  const latDiff = radiusKm / 111;
  const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from(tableName)
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
  const tableName = await getActiveToiletTable();

  const { data, error } = await supabase
    .from(tableName)
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
  const tableName = await getActiveToiletTable();

  const { data, error } = await supabase
    .from(tableName)
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
  radarRequired?: number;
}> {
  const tableName = await getActiveToiletTable();

  const { count: total } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved');

  const { count: accessible } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('wheelchair', 'yes');

  const { count: babyChanging } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('baby_changing', 'yes');

  const { count: free } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .or('fee.eq.no,fee.eq.free');

  // V2 specific stat
  let radarRequired = 0;
  if (tableName === 'toilets_v2') {
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.approved')
      .eq('radar_key', 'yes');
    radarRequired = count || 0;
  }

  return {
    total: total || 0,
    accessible: accessible || 0,
    babyChanging: babyChanging || 0,
    free: free || 0,
    ...(tableName === 'toilets_v2' && { radarRequired }),
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

/**
 * Get current data source info (for admin/debugging)
 */
export async function getDataSourceInfo(): Promise<{
  tableName: string;
  isV2: boolean;
  recordCount: number;
}> {
  const tableName = await getActiveToiletTable();
  
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved');

  return {
    tableName,
    isV2: tableName === 'toilets_v2',
    recordCount: count || 0,
  };
}