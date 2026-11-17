-- Eternal Chapter – database schema
-- Run this whole file once in Supabase → SQL Editor → New query → Run.

-- =========================================================
-- Tables
-- =========================================================

create table if not exists public.invitations (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  slug         text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  design       text not null default 'golden-poruwa',
  partner1     text not null,
  partner2     text not null,
  families     text,
  story        text,
  -- [{ "key": "wedding", "label": "Wedding", "title": "...", "starts_at": "2027-02-20T09:00:00+05:30", "venue": "...", "note": "..." }]
  events       jsonb not null default '[]'::jsonb,
  rsvp_by      date,
  whatsapp     text,
  published    boolean not null default false,
  title        text not null default 'Wedding',      -- name shown in the dashboard, e.g. "Homecoming"
  -- order and visibility of the invitation's sections
  sections     jsonb not null default '[{"id":"hero","visible":true},{"id":"countdown","visible":true},{"id":"story","visible":true},{"id":"gallery","visible":true},{"id":"events","visible":true},{"id":"rsvp","visible":true}]'::jsonb,
  views        int not null default 0,
  cover_photo  text,
  music_url    text,
  gallery      jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.guests (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations(id) on delete cascade,
  token          text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  name           text not null,
  phone          text,                       -- Sri Lankan mobile without +94, e.g. 712345678
  heads          int  not null default 1 check (heads between 1 and 20),
  grp            text not null default 'Family',
  side           text not null default 'Both',
  events         text[] not null default '{}', -- event keys the guest is invited to
  created_at     timestamptz not null default now()
);
create index if not exists guests_invitation_idx on public.guests(invitation_id);

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  guest_id    uuid not null references public.guests(id) on delete cascade,
  event_key   text not null,
  status      text not null check (status in ('accepted', 'declined')),
  heads       int  not null default 0 check (heads >= 0),
  message     text check (char_length(message) <= 500),
  updated_by  text not null default 'guest' check (updated_by in ('guest', 'couple')),
  updated_at  timestamptz not null default now(),
  unique (guest_id, event_key)
);

-- =========================================================
-- Row level security
-- =========================================================

alter table public.invitations enable row level security;
alter table public.guests      enable row level security;
alter table public.rsvps       enable row level security;

-- Couples manage their own invitations
create policy "owner manages invitations" on public.invitations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Anyone can read a published invitation (the public invitation page)
create policy "public reads published invitations" on public.invitations
  for select using (published = true);

-- Couples manage guests of their own invitations
create policy "owner manages guests" on public.guests
  for all using (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  );

-- Couples manage RSVPs of their own guests
create policy "owner manages rsvps" on public.rsvps
  for all using (
    exists (select 1 from public.guests g join public.invitations i on i.id = g.invitation_id
            where g.id = guest_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.guests g join public.invitations i on i.id = g.invitation_id
            where g.id = guest_id and i.owner_id = auth.uid())
  );

-- Guests never read the guests/rsvps tables directly. They use the two
-- functions below with their private token from the link.

-- =========================================================
-- Guest functions (run with owner rights, check the token)
-- =========================================================

create or replace function public.get_guest(p_slug text, p_token text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'name',   g.name,
    'heads',  g.heads,
    'events', g.events,
    'rsvps',  coalesce((
      select json_agg(json_build_object('event_key', r.event_key, 'status', r.status,
                                        'heads', r.heads, 'message', r.message))
      from rsvps r where r.guest_id = g.id), '[]'::json)
  )
  from guests g
  join invitations i on i.id = g.invitation_id
  where i.slug = p_slug and g.token = p_token
    and (i.published or i.owner_id = auth.uid());
$$;

create or replace function public.submit_rsvp(
  p_slug text, p_token text, p_event text, p_status text, p_heads int, p_message text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest guests%rowtype;
begin
  select g.* into v_guest
  from guests g join invitations i on i.id = g.invitation_id
  where i.slug = p_slug and g.token = p_token
    and (i.published or i.owner_id = auth.uid());

  if not found then raise exception 'Invitation link not valid'; end if;
  if not (p_event = any (v_guest.events)) then raise exception 'Guest is not invited to this event'; end if;
  if p_status not in ('accepted', 'declined') then raise exception 'Invalid status'; end if;
  if p_status = 'accepted' and (p_heads < 1 or p_heads > v_guest.heads) then
    raise exception 'Heads must be between 1 and %', v_guest.heads;
  end if;

  insert into rsvps (guest_id, event_key, status, heads, message, updated_by, updated_at)
  values (v_guest.id, p_event, p_status,
          case when p_status = 'accepted' then p_heads else 0 end,
          nullif(left(trim(coalesce(p_message, '')), 500), ''), 'guest', now())
  on conflict (guest_id, event_key) do update
    set status = excluded.status, heads = excluded.heads, message = excluded.message,
        updated_by = 'guest', updated_at = now();
end;
$$;

create or replace function public.track_view(p_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update invitations set views = views + 1 where slug = p_slug and published;
$$;

grant execute on function public.get_guest(text, text) to anon, authenticated;
grant execute on function public.track_view(text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, text, int, text) to anon, authenticated;

-- =========================================================
-- Live updates for the RSVP dashboard
-- =========================================================
alter publication supabase_realtime add table public.rsvps;

-- =========================================================
-- Photos & music storage – see migrations/003_media.sql (run it after this file)
-- =========================================================
