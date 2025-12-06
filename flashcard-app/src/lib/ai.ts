type DescribeSetInput = {
  title?: string;
  words: { term: string; definition: string }[];
};

export async function generateSetDescription(
  input: DescribeSetInput
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Google AI API key is not configured. Set GOOGLE_AI_API_KEY in your environment.'
    );
  }

  if (!input.words || input.words.length === 0) {
    throw new Error('No words provided to generate a description.');
  }

  // Build a concise representation of the set content
  const previewItems = input.words.slice(0, 20);
  const previewText = previewItems
    .map((w) => `${w.term} – ${w.definition}`)
    .join('\n');

  const systemPrompt =
    'You help students by writing short, friendly study-set descriptions for flashcard apps.';

  const userPrompt = [
    input.title
      ? `Title: ${input.title}\n`
      : '',
    'Words in this set:',
    previewText,
    '',
    'Write a single-sentence description (1–2 lines) that explains what this set covers and who it is useful for.',
    'Do NOT mention that you are an AI. Do NOT list the words. Just describe the theme/level/purpose.',
  ]
    .filter(Boolean)
    .join('\n');

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 80,
    },
  };

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
      apiKey,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    let message = 'Failed to generate description.';
    try {
      const errorJson = (await response.json()) as { error?: { message?: string } };
      if (errorJson.error?.message) {
        message = errorJson.error.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const data = (await response.json()) as any;
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join(' ')
      .trim() ?? '';

  if (!text) {
    throw new Error('Google AI returned an empty description.');
  }

  return text;
}


