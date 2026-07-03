CREATE TABLE public.video_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  length TEXT NOT NULL DEFAULT '1m',
  language TEXT NOT NULL DEFAULT 'English',
  style TEXT NOT NULL DEFAULT 'Explainer',
  voice TEXT NOT NULL DEFAULT 'alloy',
  aspect TEXT NOT NULL DEFAULT '16:9',
  script JSONB,
  scenes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_projects TO authenticated;
GRANT ALL ON public.video_projects TO service_role;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their projects" ON public.video_projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert their projects" ON public.video_projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update their projects" ON public.video_projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can delete their projects" ON public.video_projects FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_video_projects_user_id ON public.video_projects(user_id, created_at DESC);
CREATE OR REPLACE FUNCTION public.set_video_projects_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER trg_video_projects_updated_at BEFORE UPDATE ON public.video_projects FOR EACH ROW EXECUTE FUNCTION public.set_video_projects_updated_at();