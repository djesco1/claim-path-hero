
-- Recreate views with security_invoker to fix security definer warnings
DROP VIEW IF EXISTS public.v_daily_active_users;
DROP VIEW IF EXISTS public.v_claim_funnel;
DROP VIEW IF EXISTS public.v_diagnostic_conversion;

CREATE VIEW public.v_daily_active_users WITH (security_invoker = true) AS
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as dau
FROM public.analytics_events
WHERE user_id IS NOT NULL
GROUP BY DATE(created_at);

CREATE VIEW public.v_claim_funnel WITH (security_invoker = true) AS
SELECT
  COUNT(CASE WHEN event_type='page_view' AND page_path='/claims/new' THEN 1 END) as wizard_opens,
  COUNT(CASE WHEN event_type='claim_created' THEN 1 END) as claims_started,
  COUNT(CASE WHEN event_type='claim_completed' THEN 1 END) as claims_completed,
  COUNT(CASE WHEN event_type='document_downloaded' THEN 1 END) as docs_downloaded,
  COUNT(CASE WHEN event_type='email_sent' THEN 1 END) as emails_sent
FROM public.analytics_events;

CREATE VIEW public.v_diagnostic_conversion WITH (security_invoker = true) AS
SELECT
  COUNT(*) as total_diagnostics,
  COUNT(CASE WHEN converted_to_claim = true THEN 1 END) as converted,
  AVG(CAST(result->>'viability_score' AS INT)) as avg_viability_score
FROM public.diagnostics;
