type DescribeSetInput = {
  title?: string;
  words: { term: string; definition: string }[];
};

export async function generateSetDescription(
  input: DescribeSetInput
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Mistral API key is not configured. Set MISTRAL_API_KEY in your environment.'
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
    'You help students by writing short, friendly study-set descriptions for flashcard apps. Keep it under 200 words. Respond with a single plain sentence only—no quotes, no markdown, no bullets.';

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

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 120,
    }),
  });

  if (!response.ok) {
    let message = "Failed to generate description.";
    try {
      const err = (await response.json()) as { error?: { message?: string } };
      if (err.error?.message) message = err.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const data = (await response.json()) as any;
  let text = data?.choices?.[0]?.message?.content?.trim() ?? '';

  // Strip surrounding quotes/asterisks/markdown markers
  text = text.replace(/^[\s"'*`]+/, '').replace(/[\s"'*`]+$/, '').trim();

  // Enforce a 200-word cap defensively
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length > 200) {
    text = parts.slice(0, 200).join(' ');
  }

  if (!text) {
    throw new Error('Mistral returned an empty description.');
  }

  return text;
}


