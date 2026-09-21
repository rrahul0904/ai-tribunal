BEGIN;

CREATE TYPE case_kind AS ENUM ('FICTIONAL', 'DOCUMENTED', 'SIMULATION');
CREATE TYPE hearing_status AS ENUM ('ACTIVE', 'DELIBERATION', 'CLOSED');
CREATE TYPE message_role AS ENUM ('USER', 'ASSISTANT');
CREATE TYPE verdict_kind AS ENUM ('SPARE', 'DELETE');
CREATE TYPE claim_status AS ENUM ('CORROBORATED', 'DISPUTED', 'UNRESOLVED', 'SYNTHETIC');

CREATE TABLE visitors (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  recovery_email text,
  research_consent_version text,
  research_consented_at timestamptz
);

CREATE TABLE cases (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind case_kind NOT NULL,
  summary text NOT NULL,
  disclosure text NOT NULL,
  claim_status claim_status NOT NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE case_sources (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text,
  publisher text,
  published_on date,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE personas (
  id uuid PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  motivation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE persona_prompt_versions (
  id uuid PRIMARY KEY,
  persona_id uuid NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  prompt_text text NOT NULL,
  prompt_sha256 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz,
  UNIQUE(persona_id, version),
  UNIQUE(persona_id, prompt_sha256)
);

CREATE TABLE hearings (
  id uuid PRIMARY KEY,
  visitor_id uuid NOT NULL REFERENCES visitors(id) ON DELETE RESTRICT,
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
  prompt_version_id uuid NOT NULL REFERENCES persona_prompt_versions(id) ON DELETE RESTRICT,
  status hearing_status NOT NULL DEFAULT 'ACTIVE',
  ai_turns smallint NOT NULL DEFAULT 0 CHECK (ai_turns BETWEEN 0 AND 6),
  provider text,
  model text,
  started_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

CREATE TABLE hearing_messages (
  id uuid PRIMARY KEY,
  hearing_id uuid NOT NULL REFERENCES hearings(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content text NOT NULL,
  provider_request_id text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX hearing_messages_hearing_created_idx ON hearing_messages(hearing_id, created_at);
CREATE INDEX hearings_visitor_started_idx ON hearings(visitor_id, started_at DESC);

CREATE TABLE verdicts (
  id uuid PRIMARY KEY,
  hearing_id uuid NOT NULL UNIQUE REFERENCES hearings(id) ON DELETE RESTRICT,
  verdict verdict_kind NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  visitor_id uuid PRIMARY KEY REFERENCES visitors(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallet_ledger (
  id uuid PRIMARY KEY,
  visitor_id uuid NOT NULL REFERENCES wallets(visitor_id) ON DELETE RESTRICT,
  entry_type text NOT NULL,
  amount integer NOT NULL CHECK (amount <> 0),
  external_reference text,
  hearing_id uuid REFERENCES hearings(id) ON DELETE RESTRICT,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entry_type, external_reference)
);

CREATE INDEX wallet_ledger_visitor_created_idx ON wallet_ledger(visitor_id, created_at);

CREATE TABLE payment_events (
  id text PRIMARY KEY,
  provider text NOT NULL,
  event_type text NOT NULL,
  payload_sha256 text NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_events (
  id uuid PRIMARY KEY,
  actor_type text NOT NULL,
  actor_id text,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION enforce_documented_case_sources()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.kind = 'DOCUMENTED' AND NEW.published_at IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM case_sources s WHERE s.case_id = NEW.id AND s.approved = true
    ) THEN
      RAISE EXCEPTION 'documented case requires at least one approved source before publication';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER documented_case_source_guard
AFTER INSERT OR UPDATE OF published_at, kind ON cases
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION enforce_documented_case_sources();

COMMIT;
