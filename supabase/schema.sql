-- ==============================================================================
-- FindSync: Production PostgreSQL Schema & RLS Policies for Supabase
-- Institutional Campus Lost-and-Found Management System
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CAMPUSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_code TEXT,
  tagline TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Linked with Supabase Auth auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  student_id TEXT,
  campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ITEMS TABLE (Authoritative Production Schema)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  color TEXT,
  description TEXT NOT NULL,
  location_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  incident_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active_search' CHECK (status IN ('active_search', 'in_custody', 'under_review', 'reunited', 'returned', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. MATCHES TABLE (Pairings between Lost & Found reports)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lost_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  found_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  similarity_score INTEGER NOT NULL CHECK (similarity_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'under_review', 'verified', 'rejected')),
  category_score INTEGER DEFAULT 0,
  visual_score INTEGER DEFAULT 0,
  proximity_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_match_pair UNIQUE (lost_item_id, found_item_id)
);

-- ------------------------------------------------------------------------------
-- 5. CLAIMS TABLE (Ownership verification requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'approved', 'rejected', 'handover_ready', 'closed')),
  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 6),
  notes TEXT,
  resolution_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CLAIM EVIDENCE ATTACHMENTS (Storage references in claim-evidence)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claim_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE (Targeted alerts for matched items & claims)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('match', 'claim_update', 'evidence_request', 'handover')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_tab TEXT,
  link_param TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. INDEXES FOR HIGH-PERFORMANCE CAMPUS QUERIES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_items_reporter ON public.items(reporter_id);
CREATE INDEX IF NOT EXISTS idx_items_campus ON public.items(campus_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_created ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_item ON public.claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_matches_lost ON public.matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_matches_found ON public.matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Campuses: Everyone can view campuses
DROP POLICY IF EXISTS "Public can view campuses" ON public.campuses;
CREATE POLICY "Public can view campuses"
  ON public.campuses FOR SELECT
  USING (true);

-- Profiles:
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Items:
-- 1. All authenticated users can view campus lost/found reports
DROP POLICY IF EXISTS "Public read access for items" ON public.items;
CREATE POLICY "Public read access for items"
  ON public.items FOR SELECT
  USING (true);

-- 2. Only authenticated users can report items, reporter_id is strictly auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.items;
CREATE POLICY "Authenticated users can create items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 3. Items can be updated by the original reporter or staff/admin
DROP POLICY IF EXISTS "Reporters and staff can update items" ON public.items;
CREATE POLICY "Reporters and staff can update items"
  ON public.items FOR UPDATE
  USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
  );

-- Claims:
-- 1. Claims viewable by claimant, item reporter, or staff/admin
DROP POLICY IF EXISTS "View claims access" ON public.claims;
CREATE POLICY "View claims access"
  ON public.claims FOR SELECT
  USING (
    auth.uid() = claimant_id OR
    EXISTS (SELECT 1 FROM public.items WHERE items.id = item_id AND items.reporter_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
  );

-- 2. Claim creation enforced for claimant_id = auth.uid()
DROP POLICY IF EXISTS "Claimants can submit claims" ON public.claims;
CREATE POLICY "Claimants can submit claims"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = claimant_id);

-- 3. Claims update by staff/admin or item reporter
DROP POLICY IF EXISTS "Staff and finders can update claims" ON public.claims;
CREATE POLICY "Staff and finders can update claims"
  ON public.claims FOR UPDATE
  USING (
    auth.uid() = claimant_id OR
    EXISTS (SELECT 1 FROM public.items WHERE items.id = item_id AND items.reporter_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
  );

-- Claim Evidence:
DROP POLICY IF EXISTS "View claim evidence" ON public.claim_evidence;
CREATE POLICY "View claim evidence"
  ON public.claim_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.claims
      WHERE claims.id = claim_id AND (
        claims.claimant_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.items WHERE items.id = claims.item_id AND items.reporter_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
      )
    )
  );

DROP POLICY IF EXISTS "Insert claim evidence" ON public.claim_evidence;
CREATE POLICY "Insert claim evidence"
  ON public.claim_evidence FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.claims WHERE claims.id = claim_id AND claims.claimant_id = auth.uid())
  );

-- Notifications:
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. REALTIME PUBLICATIONS
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'claims'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.claims;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 11. STORAGE BUCKETS & STORAGE ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Ensure private storage buckets exist: 'item-photos' and 'claim-evidence'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('item-photos', 'item-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('claim-evidence', 'claim-evidence', false, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false;

-- Storage RLS: item-photos
DROP POLICY IF EXISTS "Authenticated users can upload item photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload item photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-photos');

DROP POLICY IF EXISTS "Authenticated users can view item photos" ON storage.objects;
CREATE POLICY "Authenticated users can view item photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'item-photos');

DROP POLICY IF EXISTS "Users can update own item photos" ON storage.objects;
CREATE POLICY "Users can update own item photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own item photos" ON storage.objects;
CREATE POLICY "Users can delete own item photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS: claim-evidence
DROP POLICY IF EXISTS "Authenticated users can upload claim evidence" ON storage.objects;
CREATE POLICY "Authenticated users can upload claim evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'claim-evidence');

DROP POLICY IF EXISTS "Claimants, finders, and staff can view claim evidence" ON storage.objects;
CREATE POLICY "Claimants, finders, and staff can view claim evidence"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'claim-evidence' AND (
      EXISTS (
        SELECT 1 FROM public.claims
        WHERE claims.id::text = (storage.foldername(name))[1]
          AND (
            claims.claimant_id = auth.uid() OR
            EXISTS (SELECT 1 FROM public.items WHERE items.id = claims.item_id AND items.reporter_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin'))
          )
      )
    )
  );

-- ------------------------------------------------------------------------------
-- 12. AUTOMATIC PROFILE CREATION TRIGGER (auth.users -> public.profiles)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 13. SEED CAMPUSES
-- ------------------------------------------------------------------------------
INSERT INTO public.campuses (slug, name, short_code, tagline, latitude, longitude)
VALUES
  ('sage-bhopal', 'SAGE University, Bhopal', 'SUB', 'Katara Hills Extension, Sahara Bypass Road', 23.1785, 77.4920),
  ('sage-indore', 'SAGE University, Indore', 'SUI', 'Kailod Kartal, Rau Durg Bypass Road', 22.6850, 75.8620),
  ('main-campus', 'Main Campus (Central Quad)', 'MCC', 'Academic Quad, Library, Student Union', 23.1787, 77.4922)
ON CONFLICT (slug) DO NOTHING;

