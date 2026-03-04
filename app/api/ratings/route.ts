import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { toilet_id, rating, comment } = await request.json();

    if (!toilet_id || !rating) {
      return NextResponse.json(
        { error: 'Toilet ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert the rating
    const { error: insertError } = await supabase.from('ratings').insert({
      toilet_id,
      rating,
      comment: comment || null,
      status: 'approved', // Auto-approve ratings for now
    });

    if (insertError) {
      console.error('Error submitting rating:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit rating' },
        { status: 500 }
      );
    }

    // Update the toilet's average rating
    const { data: ratings, error: fetchError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('toilet_id', toilet_id)
      .eq('status', 'approved');

    if (!fetchError && ratings && ratings.length > 0) {
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      
      await supabase
        .from('toilets')
        .update({ 
          average_rating: Math.round(averageRating * 10) / 10,
          rating_count: ratings.length,
        })
        .eq('id', toilet_id);
    }

    return NextResponse.json(
      { message: 'Rating submitted successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
