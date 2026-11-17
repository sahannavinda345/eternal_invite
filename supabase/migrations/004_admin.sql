-- Eternal Chapter – admin panel: plans, couple profiles and limits.
-- Run once in Supabase → SQL Editor. Then make yourself admin (see the end of this file).

-- =========================================================
-- Plans (what a couple pays for)
-- =========================================================
create table if not exists public.plans (
  id               text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name             text not null,
  price            numeric not null default 0,       -- LKR
  max_invitations  int not null default 1 check (max_invitations between 0 and 100),
  allowed_designs  text[],                            -- null = every template
  sort             int not null default 0,
  created_at       timestamptz not null default now()
);

insert into public.plans (id, name, price, max_invitations, allowed_designs, sort) values
  ('basic',     'Basic',     5000,  1, array['golden-poruwa', 'eternal-noir'], 1),
  ('premium',   'Premium',   8500,  2, array['golden-poruwa', 'eternal-noir', 'kandyan-heritage', 'chapel-doors', 'velvet-night', 'wax-seal'], 2),
  ('signature', 'Signature', 12500, 3, null, 3)
on conflict (id) do nothing;

-- =========================================================
-- Profiles: one row per account (couple or admin)
-- =========================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  couple_name      text,
  phone            text,
  role             text not null default 'couple' check (role in ('couple', 'admin')),
  plan_id          text references public.plans(id) on delete set null,
  max_invitations  int not null default 1 check (max_invitations between 0 and 100),
  allowed_designs  text[],                            -- null = every template
  status           text not null default 'active' check (status in ('active', 'suspended')),
  paid_amount      numeric not null default 0,
  expires_at       date,                              -- dashboard access ends after this day
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.plans    enable row level security;
alter table public.profiles enable row level security;

-- Couples can read their own profile and the plan list; only the admin panel (service key) changes them.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid());
drop policy if exists "signed-in read plans" on public.plans;
create policy "signed-in read plans" on public.plans for select to authenticated using (true);

-- Every new account gets a profile automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts that already exist
insert into public.profiles (id, email) select id, email from auth.users on conflict (id) do nothing;

-- =========================================================
-- Enforce plan limits on invitations (couples can't get around them)
-- =========================================================
create or replace function public.enforce_plan_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p profiles%rowtype;
  used int;
begin
  -- The admin panel uses the service key (no signed-in user): no limits.
  if auth.uid() is null then return new; end if;

  select * into p from profiles where id = new.owner_id;
  if not found or p.role = 'admin' then return new; end if;

  if p.status <> 'active' or (p.expires_at is not null and p.expires_at < current_date) then
    raise exception 'Your account is paused. Please contact Eternal Chapter.';
  end if;

  if tg_op = 'INSERT' then
    select count(*) into used from invitations where owner_id = new.owner_id;
    if used >= p.max_invitations then
      raise exception 'Your plan includes % invitation(s). Contact Eternal Chapter to add more.', p.max_invitations;
    end if;
  end if;

  if p.allowed_designs is not null
     and (tg_op = 'INSERT' or new.design is distinct from old.design)
     and not (new.design = any (p.allowed_designs)) then
    raise exception 'This template is not included in your plan.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_plan_limits on public.invitations;
create trigger enforce_plan_limits before insert or update on public.invitations
  for each row execute function public.enforce_plan_limits();

-- =========================================================
-- Make yourself admin (change the email, then run this line):
-- update public.profiles set role = 'admin', max_invitations = 100 where email = 'you@example.com';
-- =========================================================
