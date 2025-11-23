import { NextRequest, NextResponse } from 'next/server';
import { generateDisneyAvatar } from '@/lib/ai';
import { insertGeneratedImage, upsertUserByFarcaster } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceProfileImageUrl, farcasterFid, walletAddress } = body ?? {};

    if (!sourceProfileImageUrl) {
      return NextResponse.json(
        { error: 'sourceProfileImageUrl is required' },
        { status: 400 }
      );
    }

    const user = await upsertUserByFarcaster(
      farcasterFid ?? 'unknown-fid',
      walletAddress
    );

    const generatedImageUrl = await generateDisneyAvatar({
      sourceImageUrl: sourceProfileImageUrl,
      userId: user.id
    });

    const generated = await insertGeneratedImage({
      userId: user.id,
      sourceProfileImageUrl,
      generatedImageUrl
    });

    return NextResponse.json(
      {
        generatedImageId: generated.id,
        generatedImageUrl,
        userId: user.id
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[generate-character] error', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
