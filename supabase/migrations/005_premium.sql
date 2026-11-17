-- Eternal Chapter – premium templates: intro video, illustration, parents, timelines, then & now photos.
-- Run once in Supabase → SQL Editor.

alter table public.invitations add column if not exists intro_video text;        -- short cinematic clip played after "Open"
alter table public.invitations add column if not exists illustration text;       -- illustrated couple (PNG with transparent background works best)
alter table public.invitations add column if not exists partner1_parents text;   -- e.g. "Son of Mr. & Mrs. Fernando"
alter table public.invitations add column if not exists partner2_parents text;
alter table public.invitations add column if not exists timeline jsonb not null default '[]'::jsonb;  -- love story: [{year,title,text}]
alter table public.invitations add column if not exists schedule jsonb not null default '[]'::jsonb;  -- the day: [{time,title,text}]
alter table public.invitations add column if not exists polaroids jsonb not null default '{}'::jsonb; -- {p1_then,p2_then,p1_now,p2_now}

-- Allow intro videos (up to 50 MB) in the media bucket
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/x-m4a', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'media';
