import { NextResponse } from 'next/server';
import { createGenerationJob } from '@/lib/content-factory';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  // 1. Verify User Session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageUrl, settings } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // 2. Call Content Factory
    const result = await createGenerationJob({
      sourceUrl: imageUrl,
      prompt: settings?.motionIntensity,
      metadata: {
        userId: user.id,
        type: 'avatar'
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
