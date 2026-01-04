import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Add contact to Brevo (formerly Sendinblue)
async function addToBrevo(email: string) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

  // Skip if Brevo is not configured
  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    console.log('Brevo not configured, skipping...');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(BREVO_LIST_ID)],
        updateEnabled: true, // Update if contact already exists
        attributes: {
          SOURCE: 'Website Waitlist',
          SIGNUP_DATE: new Date().toISOString().split('T')[0],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Don't throw error if contact already exists (code: duplicate_parameter)
      if (errorData.code !== 'duplicate_parameter') {
        console.error('Brevo API error:', errorData);
      }
    } else {
      console.log('Contact added to Brevo successfully');
    }
  } catch (error) {
    // Log but don't fail the waitlist submission
    console.error('Brevo integration error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in Supabase
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist! We'll notify you when we launch." },
        { status: 200 }
      );
    }

    // Insert new email into Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: normalizedEmail,
        created_at: new Date().toISOString(),
        source: 'website',
      });

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json(
        { error: 'Unable to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    // Add to Brevo for email marketing (non-blocking)
    addToBrevo(normalizedEmail);

    return NextResponse.json(
      { message: "🎉 You're on the list! We'll email you as soon as the app launches." },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Optional: Get waitlist count for display
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
