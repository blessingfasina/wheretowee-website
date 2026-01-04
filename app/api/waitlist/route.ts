import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Add contact to Brevo (formerly Sendinblue)
async function addToBrevo(email: string): Promise<{ success: boolean; message: string }> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

  console.log('Brevo config check:', { 
    hasApiKey: !!BREVO_API_KEY, 
    apiKeyLength: BREVO_API_KEY?.length || 0,
    listId: BREVO_LIST_ID 
  });

  // Skip if Brevo is not configured
  if (!BREVO_API_KEY) {
    console.log('BREVO_API_KEY not configured');
    return { success: false, message: 'BREVO_API_KEY not configured' };
  }
  
  if (!BREVO_LIST_ID) {
    console.log('BREVO_LIST_ID not configured');
    return { success: false, message: 'BREVO_LIST_ID not configured' };
  }

  const listIdNumber = parseInt(BREVO_LIST_ID, 10);
  if (isNaN(listIdNumber)) {
    console.log('BREVO_LIST_ID is not a valid number:', BREVO_LIST_ID);
    return { success: false, message: 'BREVO_LIST_ID is not a valid number' };
  }

  try {
    const requestBody = {
      email: email,
      listIds: [listIdNumber],
      updateEnabled: true,
      attributes: {
        SOURCE: 'Website Waitlist',
        SIGNUP_DATE: new Date().toISOString().split('T')[0],
      },
    };

    console.log('Sending to Brevo:', JSON.stringify(requestBody));

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Brevo response status:', response.status);
    console.log('Brevo response body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      
      // Contact already exists is okay
      if (errorData.code === 'duplicate_parameter') {
        console.log('Contact already exists in Brevo');
        return { success: true, message: 'Contact already exists' };
      }
      
      console.error('Brevo API error:', errorData);
      return { success: false, message: JSON.stringify(errorData) };
    }

    console.log('Contact added to Brevo successfully');
    return { success: true, message: 'Contact added successfully' };
  } catch (error) {
    console.error('Brevo integration error:', error);
    return { success: false, message: String(error) };
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

    // Add to Brevo for email marketing
    const brevoResult = await addToBrevo(normalizedEmail);
    console.log('Brevo result:', brevoResult);

    return NextResponse.json(
      { 
        message: "🎉 You're on the list! We'll email you as soon as the app launches.",
        brevo: brevoResult // Include for debugging (can remove later)
      },
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
