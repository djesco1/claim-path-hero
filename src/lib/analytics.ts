import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, unknown>;
  page_path?: string;
}

function getSessionId(): string {
  let id = sessionStorage.getItem('claimpath_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('claimpath_session', id);
  }
  return id;
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const consent = localStorage.getItem('cookie_consent');
  if (consent !== 'all') return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase.from('analytics_events') as any).insert({
      user_id: user?.id ?? null,
      session_id: getSessionId(),
      event_type: event.event_type,
      event_data: event.event_data ?? {},
      page_path: event.page_path ?? window.location.pathname,
    });
  } catch {
    // Analytics failures must NEVER break the user experience
  }
}
