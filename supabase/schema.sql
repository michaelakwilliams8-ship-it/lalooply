-- ============================================================
-- Lalooply – Supabase Schema
-- Run this SQL in the Supabase SQL Editor to set up the database.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Anon',
  coins       INTEGER     NOT NULL DEFAULT 60,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surveys (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  area        TEXT        NOT NULL,
  questions   JSONB       NOT NULL DEFAULT '[]',
  asker_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asker_name  TEXT        NOT NULL DEFAULT 'Anon',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id      UUID        NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  responder_id   UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  responder_name TEXT        NOT NULL DEFAULT 'Anon',
  responses      JSONB       NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (survey_id, responder_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys  ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers  ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by all authenticated users, writable only by owner
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Surveys: readable by all authenticated users, insertable only by asker
CREATE POLICY "surveys_select" ON surveys
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "surveys_insert" ON surveys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = asker_id);

-- Answers: readable by all authenticated users, insertable only by responder
CREATE POLICY "answers_select" ON answers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "answers_insert" ON answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = responder_id);

-- ─── Trigger: auto-create profile on sign-up ─────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, name, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anon'),
    60
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── RPC: adjust_coins (server-side coin changes only) ───────────────────────
-- All coin changes MUST go through this function to preserve integrity.

CREATE OR REPLACE FUNCTION adjust_coins(user_id UUID, amount INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE profiles
  SET coins = GREATEST(0, coins + amount)
  WHERE id = user_id
  RETURNING coins INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id;
  END IF;

  RETURN new_balance;
END;
$$;
