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

CREATE TABLE IF NOT EXISTS citacitaku_rag_documents (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  page_count INTEGER,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citacitaku_rag_careers (
  career_id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  cluster TEXT NOT NULL,
  cluster_en TEXT,
  coverage_status TEXT,
  aliases_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  what_they_do TEXT NOT NULL,
  what_they_do_en TEXT,
  primary_majors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  alternative_majors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  alternative_majors_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  core_skills_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  core_skills_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  school_subjects_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  school_subjects_en_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio_example TEXT,
  portfolio_example_en TEXT,
  entry_route_type TEXT,
  regulated_profession BOOLEAN NOT NULL DEFAULT FALSE,
  regulated_key TEXT,
  regulated_note TEXT,
  regulated_note_en TEXT,
  source_ids TEXT,
  last_checked DATE,
  searchable_text TEXT NOT NULL DEFAULT '',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_rag_careers_title_idx
ON citacitaku_rag_careers (title_id);

CREATE INDEX IF NOT EXISTS citacitaku_rag_careers_cluster_idx
ON citacitaku_rag_careers (cluster);

CREATE TABLE IF NOT EXISTS citacitaku_rag_career_aliases (
  alias_normalized TEXT PRIMARY KEY,
  career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
  canonical_title TEXT NOT NULL,
  canonical_title_en TEXT,
  cluster TEXT NOT NULL,
  cluster_en TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_rag_career_aliases_career_idx
ON citacitaku_rag_career_aliases (career_id);

CREATE TABLE IF NOT EXISTS citacitaku_rag_career_routes (
  career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
  route_no INTEGER NOT NULL,
  route_name TEXT NOT NULL,
  route_name_en TEXT,
  route_type TEXT NOT NULL,
  route_description TEXT NOT NULL,
  route_description_en TEXT,
  career_title TEXT NOT NULL,
  career_title_en TEXT,
  cluster TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (career_id, route_no)
);

CREATE TABLE IF NOT EXISTS citacitaku_rag_career_answers (
  career_id TEXT NOT NULL REFERENCES citacitaku_rag_careers(career_id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  career_title TEXT NOT NULL,
  career_title_en TEXT,
  answer_json JSONB NOT NULL,
  route_count INTEGER NOT NULL,
  weekly_action_count INTEGER NOT NULL,
  source_ids TEXT,
  last_checked DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (career_id, grade)
);

CREATE TABLE IF NOT EXISTS citacitaku_rag_chunks (
  chunk_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES citacitaku_rag_documents(id) ON DELETE CASCADE,
  chunk_type TEXT NOT NULL,
  language TEXT,
  career_id TEXT,
  grade TEXT,
  cluster TEXT,
  title TEXT,
  chunk_text TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_ids TEXT,
  page_number INTEGER,
  last_checked DATE,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_career_grade_idx
ON citacitaku_rag_chunks (career_id, grade, chunk_type);

CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_document_idx
ON citacitaku_rag_chunks (document_id, page_number);

CREATE INDEX IF NOT EXISTS citacitaku_rag_chunks_search_idx
ON citacitaku_rag_chunks USING GIN (to_tsvector('simple', COALESCE(title, '') || ' ' || chunk_text));

CREATE TABLE IF NOT EXISTS citacitaku_rag_sources (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  how_used TEXT,
  freshness_class TEXT,
  last_checked DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citacitaku_rag_coverage_added (
  career_id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  cluster_en TEXT NOT NULL,
  source_ids TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citacitaku_rag_regulated_professions (
  career_id TEXT PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  regulated_key TEXT NOT NULL,
  regulated_note_id TEXT NOT NULL,
  regulated_note_en TEXT NOT NULL,
  source_ids TEXT,
  last_checked DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
