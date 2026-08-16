import { NextRequest, NextResponse } from 'next/server';
import { getNearbyToilets, getToiletById, enrichToiletsForMap } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Single-toilet lookup for shareable links (/map?toilet=1234)
  const idParam = searchParams.get('id');
  if (idParam) {
    const id = parseInt(idParam, 10);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid toilet id' }, { status: 400 });
    }
    try {
      const toilet = await getToiletById(id);
      if (!toilet) {
        return NextResponse.json({ error: 'Toilet not found' }, { status: 404 });
      }
      const [enriched] = await enrichToiletsForMap([toilet]);
      return NextResponse.json({ toilet: enriched });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json({ error: 'Failed to fetch toilet' }, { status: 500 });
    }
  }

  const lat = parseFloat(searchParams.get('lat') || '51.5074');
  const lng = parseFloat(searchParams.get('lng') || '-0.1278');
  const radius = parseFloat(searchParams.get('radius') || '5'); // Default 5km for better coverage
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const toilets = await enrichToiletsForMap(
      await getNearbyToilets(lat, lng, radius, limit),
    );

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

