import { parseEther, type Address } from 'viem';

type BuildMintConfigParams = {
  imageUrl: string;
  contractAddress: Address;
  to: Address;
};

/**
 * JSON metadata -> base64 -> data:application/json;base64,...
 * Browser’da çalışacağı için Node Buffer yerine btoa kullanıyoruz.
 */
function jsonToBase64DataUri(metadata: unknown): string {
  const json = JSON.stringify(metadata);

  if (typeof btoa === 'function') {
    const base64 = btoa(json);
    return `data:application/json;base64,${base64}`;
  }

  throw new Error('Base64 encoding is not available in this environment');
}

export function buildMintConfig(params: BuildMintConfigParams) {
  const metadata = {
    name: 'Disney-Style Avatar',
    description: 'A Farcaster-generated Disney-style avatar.',
    image: params.imageUrl
  };

  const tokenURI = jsonToBase64DataUri(metadata);

  return {
    address: params.contractAddress,
    functionName: 'mint' as const,
    args: [params.to, tokenURI] as const,
    value: parseEther('0.001')
  };
}
