CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farcaster_fid TEXT UNIQUE,
  wallet_address TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  source_profile_image_url TEXT,
  generated_image_url TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  generated_image_id uuid REFERENCES generated_images(id),
  tx_hash TEXT,
  network TEXT,
  price_eth TEXT,
  created_at timestamptz DEFAULT now()
);
