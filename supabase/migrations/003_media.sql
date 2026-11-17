-- Eternal Chapter – photos & music.
-- Run once in Supabase → SQL Editor (new and existing projects).

alter table public.invitations add column if not exists cover_photo text;  -- couple photo shown on the opening screen
alter table public.invitations add column if not exists music_url text;    -- background music (mp3/m4a)
alter table public.invitations add column if not exists gallery jsonb not null default '[]'::jsonb; -- photo URLs

-- Public bucket for invitation photos and music (max 15 MB per file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 15728640,
        array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do nothing;

-- Anyone can view files (guests see photos and hear music).
-- Couples can only add, change or delete files inside their own folder: <user id>/...
drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');

drop policy if exists "media owner insert" on storage.objects;
create policy "media owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media owner update" on storage.objects;
create policy "media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "media owner delete" on storage.objects;
create policy "media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
