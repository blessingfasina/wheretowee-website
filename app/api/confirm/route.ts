import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * "Is this loo still here?" — feeds the same community-verification
 * pipeline the mobile app uses (`set_toilet_status` RPC + the
 * toilet_confirmations table). Two reversible answers per device:
 *
 *   'exists'    → yes, still here
 *   'not_found' → no, it's gone / wrong place
 *
 * device_id is an anonymous UUID the browser stores in localStorage,
 * mirroring the app's SharedPreferences device id. A device only ever
 * has one active answer per toilet; answering again overwrites it.
 */
export async function POST(request: NextRequest) {
  try {
    const { toilet_id, device_id, status } = await request.json();

    if (!toilet_id || typeof toilet_id !== 'number') {
      return NextResponse.json({ error: 'toilet_id is required' }, { status: 400 });
    }
    if (!device_id || typeof device_id !== 'string' || device_id.length > 64) {
      return NextResponse.json({ error: 'device_id is required' }, { status: 400 });
    }
    if (status !== 'exists' && status !== 'not_found') {
      return NextResponse.json(
        { error: "status must be 'exists' or 'not_found'" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc('set_toilet_status', {
      p_toilet_id: toilet_id,
      p_device_id: device_id,
      p_status: status,
    });

    if (error) {
      console.error('set_toilet_status RPC error:', error);
      return NextResponse.json({ error: 'Failed to record your answer' }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    return NextResponse.json(
      {
        message: 'Answer recorded',
        user_status: row?.user_status ?? status,
        last_confirmed_at: row?.last_confirmed_at ?? null,
        confirmation_count: row?.confirmation_count ?? null,
        not_found_count: row?.not_found_count ?? null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
