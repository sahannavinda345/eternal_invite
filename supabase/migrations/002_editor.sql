-- Eternal Chapter – update for the live editor, multiple invitations and page views.
-- If you already ran schema.sql before, run THIS file once in Supabase → SQL Editor.
-- (New projects: schema.sql already includes everything below.)

alter table public.invitations add column if not exists title text not null default 'Wedding';
alter table public.invitations add column if not exists sections jsonb not null default
  '[{"id":"hero","visible":true},{"id":"countdown","visible":true},{"id":"story","visible":true},{"id":"events","visible":true},{"id":"rsvp","visible":true}]'::jsonb;
alter table public.invitations add column if not exists views int not null default 0;

-- Count a guest opening a published invitation
create or replace function public.track_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update invitations set views = views + 1 where slug = p_slug and published;
$$;

grant execute on function public.track_view(text) to anon, authenticated;
