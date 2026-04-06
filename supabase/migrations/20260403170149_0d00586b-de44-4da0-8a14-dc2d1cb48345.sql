
-- Add missing columns to existing tables (safe: IF NOT EXISTS or try/catch via DO blocks)
DO $$ BEGIN
  ALTER TABLE claim_timeline ADD COLUMN IF NOT EXISTS user_id uuid;
  ALTER TABLE claim_timeline ADD COLUMN IF NOT EXISTS metadata jsonb;
  ALTER TABLE documents ADD COLUMN IF NOT EXISTS user_id uuid;
  ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS title text;
  ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS mode text DEFAULT 'general';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id uuid REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  cc_emails text[],
  subject text NOT NULL,
  body_preview text,
  pdf_attached boolean DEFAULT true,
  resend_message_id text,
  status text DEFAULT 'sent',
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email logs" ON public.email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create diagnostics table
CREATE TABLE IF NOT EXISTS public.diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  answers jsonb NOT NULL,
  result jsonb NOT NULL,
  converted_to_claim boolean DEFAULT false,
  claim_id uuid REFERENCES public.claims(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnostics" ON public.diagnostics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert diagnostics" ON public.diagnostics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own diagnostics" ON public.diagnostics
  FOR UPDATE USING (auth.uid() = user_id);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  event_data jsonb,
  page_path text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_claim_id ON public.email_logs(claim_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_session ON public.diagnostics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);

-- Update legal_knowledge policy to require authentication
DROP POLICY IF EXISTS "Anyone can read legal knowledge" ON public.legal_knowledge;
CREATE POLICY "Authenticated users can read legal knowledge" ON public.legal_knowledge
  FOR SELECT TO authenticated USING (true);

-- Analytics views
CREATE OR REPLACE VIEW public.v_daily_active_users AS
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as dau
FROM public.analytics_events
WHERE user_id IS NOT NULL
GROUP BY DATE(created_at);

CREATE OR REPLACE VIEW public.v_claim_funnel AS
SELECT
  COUNT(CASE WHEN event_type='page_view' AND page_path='/claims/new' THEN 1 END) as wizard_opens,
  COUNT(CASE WHEN event_type='claim_created' THEN 1 END) as claims_started,
  COUNT(CASE WHEN event_type='claim_completed' THEN 1 END) as claims_completed,
  COUNT(CASE WHEN event_type='document_downloaded' THEN 1 END) as docs_downloaded,
  COUNT(CASE WHEN event_type='email_sent' THEN 1 END) as emails_sent
FROM public.analytics_events;

CREATE OR REPLACE VIEW public.v_diagnostic_conversion AS
SELECT
  COUNT(*) as total_diagnostics,
  COUNT(CASE WHEN converted_to_claim = true THEN 1 END) as converted,
  AVG(CAST(result->>'viability_score' AS INT)) as avg_viability_score
FROM public.diagnostics;
