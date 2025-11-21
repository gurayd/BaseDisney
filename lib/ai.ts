type GenerateOptions = {
  sourceImageUrl: string;
  userId: string;
};

export async function generateDisneyAvatar(options: GenerateOptions): Promise<string> {
  const apiUrl = process.env.AI_API_URL;
  const apiKey = process.env.AI_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('AI API configuration is missing');
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        imageUrl: options.sourceImageUrl,
        style: 'disney_avatar',
        userId: options.userId
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI provider error: ${text}`);
    }

    const data = (await res.json()) as { imageUrl?: string };

    if (!data.imageUrl) {
      throw new Error('AI response missing imageUrl');
    }

    return data.imageUrl;
  } catch (err) {
    console.error('[generateDisneyAvatar] error', err);
    throw err;
  }
}
