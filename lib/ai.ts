type GenerateOptions = {
  sourceImageUrl: string;
  userId: string;
};

export async function generateDisneyAvatar(options: GenerateOptions): Promise<string> {
  const apiUrl =
    process.env.AI_API_URL || 'https://api.openai.com/v1/images/edits';
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error('AI_API_KEY is missing');
  }

  try {
    const imageResponse = await fetch(options.sourceImageUrl);
    if (!imageResponse.ok) {
      const text = await imageResponse.text();
      throw new Error(`Failed to fetch source image: ${imageResponse.status} ${text}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

    const formData = new FormData();
    formData.append('image', imageBlob, 'source.png');
    formData.append(
      'prompt',
      'Transform this person into a Disney/Pixar-style animated character portrait, keep facial identity and pose, clean soft shading, vibrant colors, high quality.'
    );
    formData.append('model', 'gpt-image-1');
    formData.append('size', '1024x1024');
    formData.append('output_format', 'png');

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI provider error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error('AI response missing b64_json');
    }

    return `data:image/png;base64,${b64}`;
  } catch (err) {
    console.error('[generateDisneyAvatar] error', err);
    throw err;
  }
}
