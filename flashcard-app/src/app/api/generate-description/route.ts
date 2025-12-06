import { NextRequest, NextResponse } from 'next/server';
import { generateSetDescription } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      words?: { term: string; definition: string }[];
    };

    if (!body.words || !Array.isArray(body.words) || body.words.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one word for description generation.' },
        { status: 400 }
      );
    }

    const description = await generateSetDescription({
      title: body.title,
      words: body.words,
    });

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating description', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate description.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


