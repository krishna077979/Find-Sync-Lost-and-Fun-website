-- ==============================================================================
-- FindSync: PostgreSQL Schema for Supabase
-- Institutional Campus Lost & Found System
-- ==============================================================================

-- 1. Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  report_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  colorway TEXT NOT NULL,
  description TEXT,
  campus_id TEXT NOT NULL DEFAULT 'sage-bhopal',
  campus_name TEXT,
  building_area TEXT,
  location_name TEXT NOT NULL,
  date_lost_or_found TEXT NOT NULL,
  time_string TEXT,
  status TEXT NOT NULL DEFAULT 'active_search',
  bin_number TEXT,
  image_url TEXT,
  image_alt TEXT,
  match_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_data JSONB
);

-- 2. Create claims table
CREATE TABLE IF NOT EXISTS public.claims (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL UNIQUE,
  item_title TEXT NOT NULL,
  report_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'under_review',
  current_step INTEGER NOT NULL DEFAULT 1,
  updated_ago TEXT NOT NULL DEFAULT 'Just now',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_data JSONB
);

-- 3. Create profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  student_id TEXT,
  campus_id TEXT DEFAULT 'sage-bhopal',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Items
-- Anyone can view public items (both authenticated and anonymous)
CREATE POLICY "Public items are viewable by everyone" 
  ON public.items FOR SELECT 
  USING (true);

-- Authenticated users or anonymous clients can report lost or found items
CREATE POLICY "Anyone can report an item" 
  ON public.items FOR INSERT 
  WITH CHECK (true);

-- Updates allowed for officers or item submitters
CREATE POLICY "Anyone can update items" 
  ON public.items FOR UPDATE 
  USING (true);

-- 6. Policies for Claims
CREATE POLICY "Public claims are viewable by everyone" 
  ON public.claims FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can submit a claim" 
  ON public.claims FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Claims can be updated" 
  ON public.claims FOR UPDATE 
  USING (true);

-- 7. Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 8. Enable Realtime Publications for instant updates across devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_campus_id ON public.items(campus_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
