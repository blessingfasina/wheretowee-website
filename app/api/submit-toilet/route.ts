import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function geocodePostcode(
  postcode: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const normalised = postcode.replace(/\s+/g, '').toUpperCase();
  if (!normalised) return null;
  try {
    const resp = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(normalised)}`,
      { next: { revalidate: 86400 } },
    );
    if (!resp.ok) return null;
    const body = await resp.json();
    const result = body?.result;
    if (!result?.latitude || !result?.longitude) return null;
    return { latitude: result.latitude, longitude: result.longitude };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      name, 
      address, 
      city, 
      postcode, 
      is_free, 
      is_accessible, 
      has_baby_change,
      opening_hours,
      notes,
      submitter_email 
    } = body;

    // Validate required fields
    if (!name || !address || !city || !postcode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const coords = await geocodePostcode(postcode.trim());

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Queue in toilet_submissions for admin moderation (not the live map).
    const { data, error } = await supabase
      .from('toilet_submissions')
      .insert([
        {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          postcode: postcode.trim().toUpperCase(),
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          is_free: is_free ?? true,
          is_accessible: is_accessible ?? false,
          has_baby_change: has_baby_change ?? false,
          opening_hours: opening_hours?.trim() || null,
          notes: notes?.trim() || null,
          submitter_email: submitter_email?.trim() || null,
          status: 'pending',
          source: 'website',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to submit toilet' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Toilet submitted successfully', data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit toilet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
