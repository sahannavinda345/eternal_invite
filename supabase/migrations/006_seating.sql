-- Eternal Chapter – table arrangement (seating plans).
-- Run once in Supabase → SQL Editor.

create table if not exists public.seating_plans (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations(id) on delete cascade,
  event_key      text not null,
  -- { "tables": [{id, kind, label, x, y, seats, w?, h?}], "assignments": { "<tableId>:<seat>": "<guest id>" } }
  layout         jsonb not null default '{"tables": [], "assignments": {}}'::jsonb,
  published      boolean not null default false,   -- guests see their table on the invitation
  updated_at     timestamptz not null default now(),
  unique (invitation_id, event_key)
);

alter table public.seating_plans enable row level security;

drop policy if exists "owner manages seating" on public.seating_plans;
create policy "owner manages seating" on public.seating_plans
  for all using (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = auth.uid())
  );

-- Guests now also get their table for each event (only from published seating plans)
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
      from rsvps r where r.guest_id = g.id), '[]'::json),
    'seats',  coalesce((
      select json_agg(distinct jsonb_build_object('event_key', sp.event_key, 'table', t.value->>'label'))
      from seating_plans sp
      cross join lateral jsonb_array_elements(sp.layout->'tables') t
      where sp.invitation_id = i.id and sp.published
        and exists (select 1 from jsonb_each_text(sp.layout->'assignments') a
                    where a.value = g.id::text and split_part(a.key, ':', 1) = t.value->>'id')), '[]'::json)
  )
  from guests g
  join invitations i on i.id = g.invitation_id
  where i.slug = p_slug and g.token = p_token
    and (i.published or i.owner_id = auth.uid());
$$;
