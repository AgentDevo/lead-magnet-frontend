# Supabase Database Schemas

## Multi-Tenant Mod Marketplace

```sql
-- Users (from Supabase Auth)
-- Built-in auth.users table

-- Profiles (extend auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Mods (main content)
CREATE TABLE public.mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  featured_image_url TEXT,
  downloads INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mods are viewable by everyone"
  ON public.mods FOR SELECT USING (true);

CREATE POLICY "Users can create mods"
  ON public.mods FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own mods"
  ON public.mods FOR UPDATE USING (auth.uid() = author_id);

-- Mod Versions (track releases)
CREATE TABLE public.mod_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_notes TEXT,
  file_url TEXT NOT NULL,
  file_size_bytes INT,
  downloads INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mod_id, version)
);

ALTER TABLE public.mod_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Versions are viewable by everyone"
  ON public.mod_versions FOR SELECT USING (true);

-- Mod Tags (categorization)
CREATE TABLE public.mod_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mod_id, tag)
);

-- Reviews (user feedback)
CREATE TABLE public.mod_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_id UUID NOT NULL REFERENCES public.mods(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mod_id, author_id)
);

ALTER TABLE public.mod_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.mod_reviews FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.mod_reviews FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Downloads (analytics)
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mod_version_id UUID NOT NULL REFERENCES public.mod_versions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mods_author_id ON public.mods(author_id);
CREATE INDEX idx_mods_created_at ON public.mods(created_at DESC);
CREATE INDEX idx_mod_versions_mod_id ON public.mod_versions(mod_id);
CREATE INDEX idx_mod_reviews_mod_id ON public.mod_reviews(mod_id);
CREATE INDEX idx_downloads_created_at ON public.downloads(created_at DESC);
```

## Row Level Security (RLS) Policies

```sql
-- Function to check ownership
CREATE OR REPLACE FUNCTION public.is_mod_author(mod_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.mods
    WHERE id = mod_id AND author_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for deletes
CREATE POLICY "Users can delete their own mods"
  ON public.mods FOR DELETE USING (is_mod_author(id));

-- Policy for specific field updates
CREATE POLICY "Only author can update mod metadata"
  ON public.mods FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);
```

## Edge Functions for Real-Time Updates

```typescript
// supabase/functions/update-mod-stats/index.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Not found', { status: 404 })

  const { mod_id, version_id } = await req.json()

  // Update download count
  const { data: version, error } = await supabase
    .from('mod_versions')
    .update({ downloads: supabase.rpc('increment', { row_id: version_id }) })
    .eq('id', version_id)
    .select()
    .single()

  if (error) return new Response(error.message, { status: 400 })
  return new Response(JSON.stringify(version), { headers: { 'Content-Type': 'application/json' } })
})
```

## Real-Time Subscriptions

```typescript
// Detect new reviews and notify author
const subscription = supabase
  .channel('mods')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'mod_reviews' },
    (payload) => {
      console.log('New review:', payload.new)
      // Send notification to mod author
    }
  )
  .subscribe()
```
