-- Stores parsed SpiderFoot results from the FastAPI ingestion endpoints.

CREATE TABLE IF NOT EXISTS public.spiderfoot_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  target TEXT NOT NULL,
  target_type TEXT NOT NULL,
  count INT NOT NULL,
  parsed JSONB NOT NULL,
  ignored_events JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spiderfoot_results_scan_id
  ON public.spiderfoot_results (scan_id);
CREATE INDEX IF NOT EXISTS idx_spiderfoot_results_category
  ON public.spiderfoot_results (category);

ALTER TABLE public.spiderfoot_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spiderfoot_results_service_insert ON public.spiderfoot_results;
CREATE POLICY spiderfoot_results_service_insert
ON public.spiderfoot_results
FOR INSERT
TO service_role
WITH CHECK (true);

DROP POLICY IF EXISTS spiderfoot_results_service_select ON public.spiderfoot_results;
CREATE POLICY spiderfoot_results_service_select
ON public.spiderfoot_results
FOR SELECT
TO service_role
USING (true);

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT ON public.spiderfoot_results TO service_role;
