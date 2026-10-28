-- ==============================================================================
-- FindSync: PostgreSQL Schema for Supabase
-- Institutional Campus Lost & Found System
-- ==============================================================================

-- 1. Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id TEXT PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users ON DELETE SET NULL,
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
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  claim_id TEXT NOT NULL UNIQUE,
  item_title TEXT NOT NULL,
  report_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'under_review',
  current_step INTEGER NOT NULL DEFAULT 1,
  updated_ago TEXT NOT NULL DEFAULT 'Just now',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_data JSONB
);

-- Keep existing installations compatible with the ownership fields above.
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES auth.users ON DELETE SET NULL;
ALTER TABLE public.claims ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users ON DELETE CASCADE;
ALTER TABLE public.claims ALTER COLUMN user_id SET DEFAULT auth.uid();
-- 3. Create profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  student_id TEXT,
  phone TEXT,
  campus_id TEXT DEFAULT 'sage-bhopal',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Profile pictures use a public bucket; users can write only inside their own folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar images are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove permissive policies from earlier versions before recreating them.
DROP POLICY IF EXISTS "Anyone can report an item" ON public.items;
DROP POLICY IF EXISTS "Anyone can update items" ON public.items;
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can report items" ON public.items;
DROP POLICY IF EXISTS "Owners and staff can update items" ON public.items;

DROP POLICY IF EXISTS "Public claims are viewable by everyone" ON public.claims;
DROP POLICY IF EXISTS "Anyone can submit a claim" ON public.claims;
DROP POLICY IF EXISTS "Claims can be updated" ON public.claims;
DROP POLICY IF EXISTS "Owners and staff can view claims" ON public.claims;
DROP POLICY IF EXISTS "Authenticated users can submit claims" ON public.claims;
DROP POLICY IF EXISTS "Staff can update claims" ON public.claims;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own student profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile details" ON public.profiles;

-- 5. Policies for Items
CREATE POLICY "Public items are viewable by everyone" 
  ON public.items FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can report items"
  ON public.items FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Owners and staff can update items"
  ON public.items FOR UPDATE 
  TO authenticated
  USING (
    reporter_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin'))
  )
  WITH CHECK (
    reporter_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin'))
  );

-- 6. Policies for Claims
CREATE POLICY "Owners and staff can view claims"
  ON public.claims FOR SELECT 
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin'))
  );

CREATE POLICY "Authenticated users can submit claims"
  ON public.claims FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update claims"
  ON public.claims FOR UPDATE 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin')));

-- 7. Policies for Profiles
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own student profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'student');

CREATE POLICY "Users can update their own profile details"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the role column server-managed while permitting personal profile edits.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() = OLD.id AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Profile roles can only be assigned by an administrator.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_role_escalation
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- Create a student profile at signup. Staff roles must be assigned by an administrator.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, campus_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'campus_id', 'sage-bhopal'),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();

-- 8. Enable Realtime Publications for instant updates across devices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'claims'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_campus_id ON public.items(campus_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(type);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at DESC);
