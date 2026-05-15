-- Tables used by frontend account history management.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.user_profile_usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL CHECK (char_length(username) BETWEEN 3 AND 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, username)
);

CREATE TABLE IF NOT EXISTS public.user_profile_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, email)
);

CREATE TABLE IF NOT EXISTS public.user_profile_phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prefix TEXT NOT NULL CHECK (prefix ~ '^\+[1-9][0-9]{0,3}$'),
  phone_number TEXT NOT NULL CHECK (phone_number ~ '^[0-9]{4,14}$'),
  e164 TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, e164)
);

CREATE INDEX IF NOT EXISTS idx_user_profile_usernames_user_id
  ON public.user_profile_usernames (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_emails_user_id
  ON public.user_profile_emails (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_phones_user_id
  ON public.user_profile_phones (user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profile_usernames_updated_at ON public.user_profile_usernames;
CREATE TRIGGER trg_user_profile_usernames_updated_at
BEFORE UPDATE ON public.user_profile_usernames
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_profile_emails_updated_at ON public.user_profile_emails;
CREATE TRIGGER trg_user_profile_emails_updated_at
BEFORE UPDATE ON public.user_profile_emails
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_user_profile_phones_updated_at ON public.user_profile_phones;
CREATE TRIGGER trg_user_profile_phones_updated_at
BEFORE UPDATE ON public.user_profile_phones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

ALTER TABLE public.user_profile_usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile_phones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profile_usernames_select_own ON public.user_profile_usernames;
CREATE POLICY user_profile_usernames_select_own
ON public.user_profile_usernames
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_usernames_insert_own ON public.user_profile_usernames;
CREATE POLICY user_profile_usernames_insert_own
ON public.user_profile_usernames
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_usernames_update_own ON public.user_profile_usernames;
CREATE POLICY user_profile_usernames_update_own
ON public.user_profile_usernames
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_usernames_delete_own ON public.user_profile_usernames;
CREATE POLICY user_profile_usernames_delete_own
ON public.user_profile_usernames
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_emails_select_own ON public.user_profile_emails;
CREATE POLICY user_profile_emails_select_own
ON public.user_profile_emails
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_emails_insert_own ON public.user_profile_emails;
CREATE POLICY user_profile_emails_insert_own
ON public.user_profile_emails
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_emails_update_own ON public.user_profile_emails;
CREATE POLICY user_profile_emails_update_own
ON public.user_profile_emails
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_emails_delete_own ON public.user_profile_emails;
CREATE POLICY user_profile_emails_delete_own
ON public.user_profile_emails
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_phones_select_own ON public.user_profile_phones;
CREATE POLICY user_profile_phones_select_own
ON public.user_profile_phones
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_phones_insert_own ON public.user_profile_phones;
CREATE POLICY user_profile_phones_insert_own
ON public.user_profile_phones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_phones_update_own ON public.user_profile_phones;
CREATE POLICY user_profile_phones_update_own
ON public.user_profile_phones
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_profile_phones_delete_own ON public.user_profile_phones;
CREATE POLICY user_profile_phones_delete_own
ON public.user_profile_phones
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_usernames TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_emails TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile_phones TO authenticated;