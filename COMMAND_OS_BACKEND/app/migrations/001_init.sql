-- COMMAND CENTER OS · initial schema
-- Postgres 16 · enable extensions where safe
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector is optional (only needed for AI Brain RAG); requires the extension on the host
-- CREATE EXTENSION IF NOT EXISTS vector;

-- ======================================================================
-- ENTITIES & PEOPLE
-- ======================================================================
CREATE TABLE IF NOT EXISTS business (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            text UNIQUE NOT NULL,
  name            text NOT NULL,
  type            text NOT NULL,                 -- 'practice' | 'lab' | 'academy' | 'saas' | 'group'
  parent_id       uuid REFERENCES business(id) ON DELETE SET NULL,
  color           text,
  target_monthly  numeric(12,2),
  location        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_business_slug ON business(slug);

CREATE TABLE IF NOT EXISTS person (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username        text UNIQUE NOT NULL,
  email           text,
  name            text NOT NULL,
  password_hash   text NOT NULL,
  role            text NOT NULL,                 -- 'CEO' | 'COO' | 'Marketing Lead' | 'SDR' | ...
  scope_layers    text[] NOT NULL DEFAULT '{}',  -- ['control','execution','brain','growth','data']
  scope_modules   text[] NOT NULL DEFAULT '{}',
  whatsapp        text,
  manager_id      uuid REFERENCES person(id) ON DELETE SET NULL,
  hourly_rate     numeric(8,2),
  output_only     boolean NOT NULL DEFAULT false,
  color           text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_person_role ON person(role);

CREATE TABLE IF NOT EXISTS person_business (
  person_id uuid REFERENCES person(id) ON DELETE CASCADE,
  business_id uuid REFERENCES business(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, business_id)
);

CREATE TABLE IF NOT EXISTS session (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id   uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  ip          inet,
  device      text
);

-- ======================================================================
-- EXECUTION ENGINE
-- ======================================================================
CREATE TABLE IF NOT EXISTS project (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  business_id     uuid REFERENCES business(id) ON DELETE SET NULL,
  owner_id        uuid REFERENCES person(id) ON DELETE SET NULL,
  deadline        date,
  kpi_metric      text,
  kpi_target      numeric,
  progress_pct    int NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'planning',  -- planning | active | done | killed
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                text NOT NULL,
  body_md              text,
  business_id          uuid REFERENCES business(id) ON DELETE SET NULL,
  owner_id             uuid NOT NULL REFERENCES person(id) ON DELETE RESTRICT,  -- ExecutionGuard: NEVER NULL
  assigned_by          uuid REFERENCES person(id) ON DELETE SET NULL,
  status               text NOT NULL DEFAULT 'backlog',  -- draft | backlog | today | in_progress | review | blocked | done
  priority             text NOT NULL DEFAULT 'P2',
  due_at               timestamptz NOT NULL,                              -- ExecutionGuard: NEVER NULL
  source               text NOT NULL DEFAULT 'manual',                    -- manual | voice | rule | ai | automation | email_convert
  source_ref           text,
  completion_proof_url text,
  kpi_metric           text,
  kpi_delta            numeric,
  parent_task_id       uuid REFERENCES task(id) ON DELETE SET NULL,
  project_id           uuid REFERENCES project(id) ON DELETE SET NULL,
  approved_by          uuid REFERENCES person(id) ON DELETE SET NULL,
  approved_at          timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_owner_status_due ON task(owner_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_task_business ON task(business_id);

CREATE TABLE IF NOT EXISTS task_event (
  id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id   uuid NOT NULL REFERENCES task(id) ON DELETE CASCADE,
  kind      text NOT NULL,                 -- created | reassigned | status_changed | feedback | proof | approved
  actor_id  uuid REFERENCES person(id) ON DELETE SET NULL,
  payload   jsonb NOT NULL DEFAULT '{}',
  at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_attachment (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    uuid NOT NULL REFERENCES task(id) ON DELETE CASCADE,
  person_id  uuid REFERENCES person(id) ON DELETE SET NULL,
  s3_key     text NOT NULL,
  mime       text,
  kind       text NOT NULL DEFAULT 'proof',  -- proof | brief | revision
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS output_review (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     uuid NOT NULL REFERENCES task(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES person(id) ON DELETE RESTRICT,
  verdict     text NOT NULL,                  -- approve | reject | revise
  notes       text,
  at          timestamptz NOT NULL DEFAULT now()
);

-- ======================================================================
-- DAILY ROUTINES
-- ======================================================================
CREATE TABLE IF NOT EXISTS routine_template (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role        text NOT NULL,
  time_local  time NOT NULL,
  title       text NOT NULL,
  detail      text,
  week_phase  int
);
CREATE TABLE IF NOT EXISTS routine_log (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id     uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  template_id   uuid NOT NULL REFERENCES routine_template(id) ON DELETE CASCADE,
  date          date NOT NULL,
  completed_at  timestamptz,
  notes         text,
  voice_url     text,
  UNIQUE (person_id, template_id, date)
);

-- ======================================================================
-- COMMERCIAL
-- ======================================================================
CREATE TABLE IF NOT EXISTS revenue_snapshot (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  date        date NOT NULL,
  gross       numeric(12,2) NOT NULL DEFAULT 0,
  net         numeric(12,2),
  source      text NOT NULL,                  -- dentally | manual | xero | ga4 | stripe
  source_ref  text,
  UNIQUE (business_id, date, source)
);
CREATE TABLE IF NOT EXISTS expense_line (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  date        date NOT NULL,
  category    text NOT NULL,
  amount      numeric(12,2) NOT NULL,
  vendor      text,
  source      text NOT NULL DEFAULT 'manual'
);
CREATE TABLE IF NOT EXISTS cashflow_snapshot (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  date        date NOT NULL,
  cash_in     numeric(12,2) NOT NULL DEFAULT 0,
  cash_out    numeric(12,2) NOT NULL DEFAULT 0,
  balance     numeric(12,2)
);

-- ======================================================================
-- PIPELINE / CRM
-- ======================================================================
CREATE TABLE IF NOT EXISTS lead (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  source          text,
  persona         text,
  name            text,
  email           text,
  phone           text,
  stage           text NOT NULL DEFAULT 'lead',  -- lead | contacted | booked | won | lost
  value_est       numeric(12,2),
  ghl_contact_id  text,
  owner_id        uuid REFERENCES person(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_touched_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_stage_business ON lead(business_id, stage);

CREATE TABLE IF NOT EXISTS booking (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id                  uuid REFERENCES lead(id) ON DELETE SET NULL,
  business_id              uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  slot                     timestamptz NOT NULL,
  status                   text NOT NULL DEFAULT 'booked',  -- booked | attended | no_show | cancelled
  no_show_recovery_task_id uuid REFERENCES task(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- ======================================================================
-- MARKETING
-- ======================================================================
CREATE TABLE IF NOT EXISTS ad_account (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id      uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  platform         text NOT NULL,             -- meta | google | linkedin | tiktok
  account_id       text NOT NULL,
  oauth_token_enc  text,
  expires_at       timestamptz,
  UNIQUE (platform, account_id)
);
CREATE TABLE IF NOT EXISTS ad_campaign (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_account_id   uuid NOT NULL REFERENCES ad_account(id) ON DELETE CASCADE,
  ext_id          text NOT NULL,
  name            text NOT NULL,
  status          text,
  daily_budget    numeric(10,2),
  last_synced_at  timestamptz,
  UNIQUE (ad_account_id, ext_id)
);
CREATE TABLE IF NOT EXISTS ad_metric (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id     uuid NOT NULL REFERENCES ad_campaign(id) ON DELETE CASCADE,
  date            date NOT NULL,
  spend           numeric(12,2) NOT NULL DEFAULT 0,
  impressions     bigint NOT NULL DEFAULT 0,
  clicks          int NOT NULL DEFAULT 0,
  conversions     int NOT NULL DEFAULT 0,
  cpa             numeric(10,2),
  roas            numeric(8,2),
  UNIQUE (campaign_id, date)
);

CREATE TABLE IF NOT EXISTS seo_property (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  gsc_site      text,
  ahrefs_domain text
);
CREATE TABLE IF NOT EXISTS seo_keyword (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id         uuid NOT NULL REFERENCES seo_property(id) ON DELETE CASCADE,
  keyword             text NOT NULL,
  position_today      numeric(5,2),
  position_yesterday  numeric(5,2),
  volume              int,
  intent              text,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, keyword)
);
CREATE TABLE IF NOT EXISTS backlink (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES seo_property(id) ON DELETE CASCADE,
  url         text NOT NULL,
  da          int,
  link_type   text,
  status      text,
  first_seen  date,
  last_seen   date
);

CREATE TABLE IF NOT EXISTS content_item (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  channel       text NOT NULL,
  format        text NOT NULL,
  title         text NOT NULL,
  body_md       text,
  status        text NOT NULL DEFAULT 'idea',
  owner_id      uuid REFERENCES person(id) ON DELETE SET NULL,
  scheduled_at  timestamptz,
  published_at  timestamptz,
  ext_id        text
);

CREATE TABLE IF NOT EXISTS competitor (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  uuid REFERENCES business(id) ON DELETE SET NULL,
  name         text NOT NULL,
  geo          text,
  ad_lib_url   text,
  last_change_at timestamptz
);
CREATE TABLE IF NOT EXISTS competitor_event (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id uuid NOT NULL REFERENCES competitor(id) ON DELETE CASCADE,
  kind          text NOT NULL,
  payload       jsonb NOT NULL DEFAULT '{}',
  observed_at   timestamptz NOT NULL DEFAULT now()
);

-- ======================================================================
-- JOURNEY ENGINE
-- ======================================================================
CREATE TABLE IF NOT EXISTS journey_stage (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid NOT NULL REFERENCES business(id) ON DELETE CASCADE,
  name        text NOT NULL,
  order_index int NOT NULL,
  kpi         text
);
CREATE TABLE IF NOT EXISTS journey_step (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_id     uuid NOT NULL REFERENCES journey_stage(id) ON DELETE CASCADE,
  person_id    uuid REFERENCES person(id) ON DELETE SET NULL,
  contact_ref  text,                          -- lead.id or external contact
  status       text NOT NULL DEFAULT 'open',
  started_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  sla_hours    int
);

-- ======================================================================
-- AI BRAIN
-- ======================================================================
CREATE TABLE IF NOT EXISTS document (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  uuid REFERENCES business(id) ON DELETE SET NULL,
  person_id    uuid REFERENCES person(id) ON DELETE SET NULL,
  s3_key       text NOT NULL,
  kind         text,
  title        text,
  mime         text,
  ingested_at  timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS document_chunk (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL REFERENCES document(id) ON DELETE CASCADE,
  ord         int NOT NULL,
  text        text NOT NULL
  -- embedding vector(1536)              -- enable when pgvector ready
);

CREATE TABLE IF NOT EXISTS ai_directive (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id     uuid REFERENCES person(id) ON DELETE SET NULL,
  business_id   uuid REFERENCES business(id) ON DELETE SET NULL,
  kind          text NOT NULL,                  -- action | warning | opportunity
  text          text NOT NULL,
  action_url    text,
  score         numeric(4,3) NOT NULL DEFAULT 0,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  dismissed_at  timestamptz,
  task_id       uuid REFERENCES task(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_directive_person ON ai_directive(person_id, dismissed_at);

CREATE TABLE IF NOT EXISTS ai_warning (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid REFERENCES business(id) ON DELETE SET NULL,
  kind        text NOT NULL,
  severity    int NOT NULL DEFAULT 1,
  text        text NOT NULL,
  evidence    jsonb NOT NULL DEFAULT '{}',
  opened_at   timestamptz NOT NULL DEFAULT now(),
  closed_at   timestamptz
);

-- ======================================================================
-- INTEGRATIONS
-- ======================================================================
CREATE TABLE IF NOT EXISTS oauth_token (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id           uuid REFERENCES person(id) ON DELETE CASCADE,
  provider            text NOT NULL,
  access_token_enc    text NOT NULL,
  refresh_token_enc   text,
  scope               text,
  expires_at          timestamptz,
  meta                jsonb NOT NULL DEFAULT '{}',
  UNIQUE (person_id, provider)
);
CREATE TABLE IF NOT EXISTS gmail_message (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id             uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  msg_id                text NOT NULL,
  thread_id             text,
  from_addr             text,
  subject               text,
  snippet               text,
  received_at           timestamptz,
  converted_to_task_id  uuid REFERENCES task(id) ON DELETE SET NULL,
  UNIQUE (person_id, msg_id)
);
CREATE TABLE IF NOT EXISTS calendar_event (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id   uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  ext_id      text NOT NULL,
  calendar_id text,
  title       text,
  start_at    timestamptz NOT NULL,
  end_at      timestamptz,
  attendees   text[]
);

-- ======================================================================
-- AUTOMATION
-- ======================================================================
CREATE TABLE IF NOT EXISTS automation_rule (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  trigger_kind    text NOT NULL,
  trigger_config  jsonb NOT NULL DEFAULT '{}',
  action_kind     text NOT NULL,
  action_config   jsonb NOT NULL DEFAULT '{}',
  enabled         boolean NOT NULL DEFAULT true,
  owner_id        uuid REFERENCES person(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_fired_at   timestamptz
);
CREATE TABLE IF NOT EXISTS automation_run (
  id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id   uuid NOT NULL REFERENCES automation_rule(id) ON DELETE CASCADE,
  fired_at  timestamptz NOT NULL DEFAULT now(),
  payload   jsonb NOT NULL DEFAULT '{}',
  result    text,
  task_ids  uuid[]
);

-- ======================================================================
-- NOTIFICATIONS
-- ======================================================================
CREATE TABLE IF NOT EXISTS notification (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id  uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  kind       text NOT NULL,
  severity   int NOT NULL DEFAULT 1,
  title      text NOT NULL,
  body       text,
  url        text,
  channels   text[] NOT NULL DEFAULT '{}',
  sent_at    timestamptz,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notification_person_unread ON notification(person_id) WHERE read_at IS NULL;
