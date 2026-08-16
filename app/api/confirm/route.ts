import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * "Confirm this loo still exists" — feeds the same community-verification
 * pipeline the mobile app uses (`confirm_toilet` RPC + toilet_confirmations
 * table). device_id is an anonymous UUID the browser stores in localStorage,
 * mirroring the app's SharedPreferences device id. One confirmation per
 * device per toilet; re-confirming just refreshes the timestamp.
 */
export async function POST(request: NextRequest) {
  try {
    const { toilet_id, device_id } = await request.json();

    if (!toilet_id || typeof toilet_id !== 'number') {
      return NextResponse.json({ error: 'toilet_id is required' }, { status: 400 });
    }
    if (!device_id || typeof device_id !== 'string' || device_id.length > 64) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('confirm_toilet', {
      p_toilet_id: toilet_id,
      p_device_id: device_id,
      p_confirmation_type: 'exists',
    });

    if (error) {
      console.error('confirm_toilet RPC error:', error);
      return NextResponse.json({ error: 'Failed to record confirmation' }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json(
      {
        message: 'Confirmation recorded',
        last_confirmed_at: row?.last_confirmed_at ?? null,
        confirmation_count: row?.confirmation_count ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
