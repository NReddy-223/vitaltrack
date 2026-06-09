-- VitalTrack Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── personal details (one row per user) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS personal_details (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name   TEXT,
  age         INTEGER CHECK (age > 0 AND age < 150),
  gender      TEXT,
  weight      DECIMAL CHECK (weight > 0),
  height      DECIMAL CHECK (height > 0),
  health_goal TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── health logs (many rows per user) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS health_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  water_intake     DECIMAL  NOT NULL CHECK (water_intake >= 0),
  exercise_minutes INTEGER  NOT NULL CHECK (exercise_minutes >= 0),
  sleep_hours      DECIMAL  NOT NULL CHECK (sleep_hours >= 0),
  mood             TEXT     NOT NULL,
  calories         INTEGER  NOT NULL CHECK (calories >= 0),
  steps            INTEGER  NOT NULL CHECK (steps >= 0),
  logged_at        TIMESTAMPTZ DEFAULT now()
);

-- ── indexes for faster queries ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id  ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_logged_at ON health_logs(logged_at);

-- ── Row Level Security (optional but recommended) ─────────────────────────────
-- Uncomment these if you ever access Supabase directly from the frontend.
-- Since we use a backend, these are not required but are good practice.

-- ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE personal_details ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE health_logs      ENABLE ROW LEVEL SECURITY;
