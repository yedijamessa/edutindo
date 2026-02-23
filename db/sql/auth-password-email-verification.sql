-- Edutindo auth schema for email/password + email verification + portal access control

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
UPDATE auth_users SET email_verified = TRUE WHERE email_verified IS NULL;
ALTER TABLE auth_users ALTER COLUMN email_verified SET DEFAULT FALSE;
ALTER TABLE auth_users ALTER COLUMN email_verified SET NOT NULL;

CREATE TABLE IF NOT EXISTS auth_email_verifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_email_verifications_user_idx
ON auth_email_verifications (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
ON auth_sessions (user_id);

CREATE TABLE IF NOT EXISTS auth_user_portals (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  portal TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, portal)
);

CREATE INDEX IF NOT EXISTS auth_user_portals_user_idx
ON auth_user_portals (user_id);
