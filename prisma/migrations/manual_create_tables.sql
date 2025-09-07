-- Manual SQL migration to create baseline tables for the Cyber Scam & Recovery Unit
-- Review before running on production. This mirrors the Prisma schema models.

CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Case" (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  loss_amount DOUBLE PRECISION,
  currency TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Evidence" (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES "Case"(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  mime_type TEXT,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "CaseEvent" (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES "Case"(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL REFERENCES "User"(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Tag" (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "CaseTag" (
  case_id INTEGER NOT NULL REFERENCES "Case"(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
  PRIMARY KEY (case_id, tag_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_case_reporter ON "Case"(reporter_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON "Evidence"(case_id);
CREATE INDEX IF NOT EXISTS idx_caseevent_case ON "CaseEvent"(case_id);
