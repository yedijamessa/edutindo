CREATE TABLE IF NOT EXISTS citacitaku_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  input_json JSONB NOT NULL,
  output_json JSONB NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_accepted BOOLEAN,
  consent_version TEXT,
  consent_text TEXT,
  provider TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_events_created_at_idx
ON citacitaku_events (created_at DESC);

CREATE INDEX IF NOT EXISTS citacitaku_events_type_created_at_idx
ON citacitaku_events (event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS citacitaku_guidance_cache (
  cache_key TEXT PRIMARY KEY,
  cache_date DATE NOT NULL,
  dream_normalized TEXT NOT NULL,
  grade TEXT NOT NULL,
  response_json JSONB NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS citacitaku_guidance_cache_expiry_idx
ON citacitaku_guidance_cache (expires_at);

CREATE TABLE IF NOT EXISTS citacitaku_generation_locks (
  cache_key TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  lease_expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citacitaku_provider_slots (
  provider TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  owner_id TEXT,
  lease_expires_at TIMESTAMPTZ,
  acquired_at TIMESTAMPTZ,
  PRIMARY KEY (provider, slot_number)
);

CREATE TABLE IF NOT EXISTS citacitaku_rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS citacitaku_rate_limit_expiry_idx
ON citacitaku_rate_limit_buckets (expires_at);

CREATE TABLE IF NOT EXISTS citacitaku_scholarships (
  id TEXT PRIMARY KEY,
  source_sheet TEXT NOT NULL,
  level TEXT NOT NULL,
  scholarship TEXT NOT NULL,
  provider TEXT,
  destination TEXT,
  type TEXT,
  status TEXT,
  application_window TEXT,
  funding_level TEXT,
  coverage TEXT,
  eligible_majors TEXT,
  key_eligibility TEXT,
  language TEXT,
  admission_offer_first TEXT,
  age_limit TEXT,
  bond_return_obligation TEXT,
  recommended_action TEXT,
  official_source_url TEXT,
  source_quality TEXT,
  last_checked DATE,
  historical BOOLEAN NOT NULL DEFAULT FALSE,
  searchable_text TEXT NOT NULL DEFAULT '',
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_scholarships_level_status_idx
ON citacitaku_scholarships (level, status);

CREATE INDEX IF NOT EXISTS citacitaku_scholarships_historical_idx
ON citacitaku_scholarships (historical);

CREATE TABLE IF NOT EXISTS citacitaku_scholarship_field_guides (
  id TEXT PRIMARY KEY,
  scholarship TEXT NOT NULL,
  field_group TEXT,
  majors_subjects TEXT,
  important_notes TEXT,
  official_source_url TEXT,
  searchable_text TEXT NOT NULL DEFAULT '',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_scholarship_field_guides_scholarship_idx
ON citacitaku_scholarship_field_guides (scholarship);
