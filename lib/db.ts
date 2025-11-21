import { sql } from '@vercel/postgres';

export type UserRecord = {
  id: string;
  farcaster_fid: string | null;
  wallet_address: string | null;
  created_at: string;
};

export type GeneratedImageRecord = {
  id: string;
  user_id: string;
  source_profile_image_url: string;
  generated_image_url: string;
  created_at: string;
};

export type MintRecord = {
  id: string;
  user_id: string;
  generated_image_id: string;
  tx_hash: string;
  network: string;
  price_eth: string;
  created_at: string;
};

export function getClient() {
  return sql;
}

export async function upsertUserByFarcaster(
  fid: string,
  walletAddress?: string
): Promise<UserRecord> {
  const client = getClient();

  const { rows } = await client<UserRecord>`
    INSERT INTO users (farcaster_fid, wallet_address)
    VALUES (${fid}, ${walletAddress ?? null})
    ON CONFLICT (farcaster_fid)
    DO UPDATE SET wallet_address = COALESCE(EXCLUDED.wallet_address, users.wallet_address)
    RETURNING *;
  `;

  return rows[0];
}

export async function insertGeneratedImage(input: {
  userId: string;
  sourceProfileImageUrl: string;
  generatedImageUrl: string;
}): Promise<GeneratedImageRecord> {
  const client = getClient();

  const { rows } = await client<GeneratedImageRecord>`
    INSERT INTO generated_images (user_id, source_profile_image_url, generated_image_url)
    VALUES (${input.userId}, ${input.sourceProfileImageUrl}, ${input.generatedImageUrl})
    RETURNING *;
  `;

  return rows[0];
}

export async function insertMintRecord(input: {
  userId: string;
  generatedImageId: string;
  txHash: string;
  network: string;
  priceEth: string;
}): Promise<MintRecord> {
  const client = getClient();

  const { rows } = await client<MintRecord>`
    INSERT INTO mints (user_id, generated_image_id, tx_hash, network, price_eth)
    VALUES (${input.userId}, ${input.generatedImageId}, ${input.txHash}, ${input.network}, ${input.priceEth})
    RETURNING *;
  `;

  return rows[0];
}
