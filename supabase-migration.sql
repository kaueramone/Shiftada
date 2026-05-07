-- ============================================================
-- SHIFTADA — MIGRATION: candidaturas, avaliações e perfil
-- Rodar no Supabase: SQL Editor → New Query → Cole e execute
-- ============================================================

-- ── 1. Novos campos no perfil do usuário ────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS conselho   text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS registro   text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS estado_uf  text;

-- ── 2. Tabela de candidaturas ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shift_applications (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id     uuid        NOT NULL REFERENCES public.shifts(id)  ON DELETE CASCADE,
  applicant_id uuid        NOT NULL REFERENCES public.users(id)   ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending',
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT shift_applications_status_check
    CHECK (status IN ('pending','contacted','completed','cancelled')),
  CONSTRAINT shift_applications_unique
    UNIQUE (shift_id, applicant_id)
);

ALTER TABLE public.shift_applications ENABLE ROW LEVEL SECURITY;

-- Candidato vê suas próprias candidaturas
CREATE POLICY "candidato_select" ON public.shift_applications
  FOR SELECT USING (applicant_id = auth.uid());

-- Dono do plantão vê os candidatos
CREATE POLICY "dono_select" ON public.shift_applications
  FOR SELECT USING (
    shift_id IN (SELECT id FROM public.shifts WHERE user_id = auth.uid())
  );

-- Qualquer usuário autenticado pode se candidatar
CREATE POLICY "candidato_insert" ON public.shift_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

-- Candidato pode cancelar a própria candidatura
CREATE POLICY "candidato_update" ON public.shift_applications
  FOR UPDATE USING (applicant_id = auth.uid());

-- Dono do plantão pode atualizar status (ex: "contacted")
CREATE POLICY "dono_update" ON public.shift_applications
  FOR UPDATE USING (
    shift_id IN (SELECT id FROM public.shifts WHERE user_id = auth.uid())
  );

-- ── 3. Tabela de avaliações ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid        NOT NULL REFERENCES public.shift_applications(id) ON DELETE CASCADE,
  from_user_id   uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shift_id       uuid        NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  rating         integer     NOT NULL,
  comment        text,
  rated_as       text        NOT NULL,
  created_at     timestamptz DEFAULT now(),
  CONSTRAINT ratings_rating_check  CHECK (rating  >= 1 AND rating <= 5),
  CONSTRAINT ratings_rated_as_check CHECK (rated_as IN ('provider','worker')),
  CONSTRAINT ratings_unique UNIQUE (application_id, from_user_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Avaliações são públicas (para exibir reputação nos perfis)
CREATE POLICY "ratings_select" ON public.ratings
  FOR SELECT USING (true);

-- Usuário só cria avaliação em seu próprio nome
CREATE POLICY "ratings_insert" ON public.ratings
  FOR INSERT WITH CHECK (from_user_id = auth.uid());
