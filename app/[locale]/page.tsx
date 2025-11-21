'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { nftAbi } from '@/lib/abi/nft';
import { buildMintConfig } from '@/lib/mint';
import { sdk } from '@farcaster/miniapp-sdk';

type MiniAppUser = { fid?: number; pfpUrl?: string | null };
type MiniAppContext = { user: MiniAppUser };

type FlowState =
  | 'idle'
  | 'generating'
  | 'readyToMint'
  | 'minting'
  | 'mintSuccess'
  | 'mintError';

type GenerateResponse = {
  generatedImageId: string;
  generatedImageUrl: string;
  userId: string;
};

const DEMO_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800';

export default function Page() {
  const t = useTranslations();
  const { address } = useAccount();
  const { writeContractAsync, isPending: isMintPending } = useWriteContract();

  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [miniAppReady, setMiniAppReady] = useState(false);
  const [miniAppContext, setMiniAppContext] = useState<MiniAppContext | null>(null);

  const contractAddress = useMemo(
    () => process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address | undefined,
    []
  );

  useEffect(() => {
    if (flowState === 'mintError' || flowState === 'mintSuccess') return;
    if (isMintPending) {
      setFlowState('minting');
    }
  }, [isMintPending, flowState]);

  useEffect(() => {
    let mounted = true;

    const initMiniApp = async () => {
      try {
        const isMini = await sdk.isInMiniApp();
        if (!mounted) return;
        setIsMiniApp(isMini);

        if (isMini) {
          const ctx = await sdk.context;
          if (!mounted) return;
          setMiniAppContext(ctx as MiniAppContext);
          await sdk.actions.ready();
        }
      } catch (err) {
        console.error('MiniApp init failed', err);
      } finally {
        if (mounted) setMiniAppReady(true);
      }
    };

    void initMiniApp();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerate = async () => {
    setFlowState('generating');
    setError(null);

    try {
      const profileImageUrl = miniAppContext?.user?.pfpUrl ?? DEMO_PROFILE_IMAGE;
      const farcasterFid =
        miniAppContext?.user?.fid != null ? String(miniAppContext.user.fid) : 'demo-fid';

      const res = await fetch('/api/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceProfileImageUrl: profileImageUrl,
          farcasterFid,
          walletAddress: address
        })
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to generate image');
      }

      const data: GenerateResponse = await res.json();
      setGeneratedImageUrl(data.generatedImageUrl);
      setGeneratedImageId(data.generatedImageId);
      setUserId(data.userId);
      setFlowState('readyToMint');
    } catch (err) {
      console.error(err);
      setError(t('error'));
      setFlowState('idle');
    }
  };

  const handleMint = async () => {
    setError(null);

    if (!address) {
      setError(t('connectWallet'));
      setFlowState('mintError');
      return;
    }

    if (!generatedImageUrl || !generatedImageId) {
      setError('No generated image to mint.');
      setFlowState('mintError');
      return;
    }

    if (!contractAddress) {
      setError('Missing NFT contract address.');
      setFlowState('mintError');
      return;
    }

    try {
      setFlowState('minting');

      const config = buildMintConfig({
        imageUrl: generatedImageUrl,
        contractAddress,
        to: address as Address
      });

      const hash = await writeContractAsync({
        ...config,
        abi: nftAbi
      });

      setTxHash(hash as string);

      await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedImageId,
          userId: userId ?? 'unknown-user',
          txHash: hash
        })
      });

      setFlowState('mintSuccess');
    } catch (err) {
      console.error(err);
      setError(t('error'));
      setFlowState('mintError');
    }
  };

  const isGenerating = flowState === 'generating';
  const isMinting = flowState === 'minting';

  const primaryButtonLabel = (() => {
    if (flowState === 'generating') return t('generating');
    if (flowState === 'readyToMint' || flowState === 'mintError') return t('mint');
    if (flowState === 'minting') return t('minting');
    if (flowState === 'mintSuccess') return t('success');
    return t('generate');
  })();

  const primaryAction = (() => {
    if (flowState === 'idle' || flowState === 'generating' || flowState === 'mintSuccess') {
      return handleGenerate;
    }
    if (flowState === 'readyToMint' || flowState === 'mintError') {
      return handleMint;
    }
    if (flowState === 'minting') {
      return () => {};
    }
    return handleGenerate;
  })();

  const cardStateText =
    flowState === 'readyToMint'
      ? t('generatedReady')
      : flowState === 'mintSuccess'
      ? t('success')
      : flowState === 'mintError'
      ? t('error')
      : t('subtitle');

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900/60 p-8 shadow-xl shadow-blue-500/10 backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-white">{t('title')}</h1>
          <p className="mt-2 text-sm text-slate-300">{cardStateText}</p>
        </div>

        <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-400">{t('farcasterPlaceholder')}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t('walletLabel')}: {address ?? t('walletNotConnected')}
          </p>
        </div>

        <div className="mb-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/80">
          {generatedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={generatedImageUrl}
              alt="Generated Disney-style avatar"
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <div className="text-center text-slate-500">
              <p className="text-sm">{t('avatarPlaceholder')}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {isMiniApp && !miniAppReady && (
          <div className="mb-4 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
            Loading Mini App context...
          </div>
        )}

        {txHash && flowState === 'mintSuccess' && (
          <div className="mb-4 rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {t('txLabel')}: {txHash}
          </div>
        )}

        <button
          onClick={primaryAction}
          disabled={
            isGenerating ||
            isMinting ||
            flowState === 'mintSuccess' ||
            (isMiniApp && !miniAppReady)
          }
          className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {primaryButtonLabel}
        </button>
      </div>
    </main>
  );
}
