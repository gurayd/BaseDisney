import { NextRequest, NextResponse } from 'next/server';
import { insertMintRecord } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generatedImageId, userId, txHash } = body ?? {};

    if (!generatedImageId || !userId || !txHash) {
      return NextResponse.json(
        { error: 'generatedImageId, userId and txHash are required' },
        { status: 400 }
      );
    }

    const mint = await insertMintRecord({
      userId,
      generatedImageId,
      txHash,
      network: 'base-mainnet',
      priceEth: '0.001'
    });

    return NextResponse.json({ ok: true, mintId: mint.id }, { status: 200 });
  } catch (err) {
    console.error('[mint] error', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
