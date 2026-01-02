import { NextRequest, NextResponse } from 'next/server';
import { getNearbyToilets } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '51.5074');
  const lng = parseFloat(searchParams.get('lng') || '-0.1278');
  const radius = parseFloat(searchParams.get('radius') || '5');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const toilets = await getNearbyToilets(lat, lng, radius, limit);
    
    return NextResponse.json({
      toilets,
      count: toilets.length,
      center: { lat, lng },
      radius,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch toilets', toilets: [] },
      { status: 500 }
    );
  }
}

