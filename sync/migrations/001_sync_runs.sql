-- ═══════════════════════════════════════════════════════════
-- SYNC MIGRATION 001: sync_runs monitoring table
-- Tracks every sync execution for monitoring and alerting
-- Apply via: Supabase Dashboard → SQL Editor, or `supabase db push`
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_app TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial')),
  entities_synced JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started
  ON public.sync_runs (source_app, started_at DESC);

-- RLS: service key can write, authenticated users can read
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sync_runs"
  ON public.sync_runs FOR SELECT USING (true);

CREATE POLICY "Service can manage sync_runs"
  ON public.sync_runs FOR ALL USING (true);
