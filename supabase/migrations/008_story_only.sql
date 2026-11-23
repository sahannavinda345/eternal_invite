-- Eternal Chapter – keep only the four Story templates.
-- Moves every invitation, plan and couple from the old templates to the closest Story template.
create or replace function public.ec_story_design(d text) returns text language sql immutable as $$
  select case
    when d in ('mughal-arch', 'ivory-deckle', 'grand-palace', 'pampas-emboss') then d
    when d in ('watercolor-story', 'wax-seal') then 'ivory-deckle'
    when d in ('chapel-doors', 'velvet-night') then 'grand-palace'
    when d in ('eternal-noir', 'coastal-drive', 'boarding-pass') then 'pampas-emboss'
    else 'mughal-arch' -- royal-kandyan, kandyan-heritage, crimson-curtain, golden-poruwa
  end
$$;

alter table public.invitations disable trigger enforce_plan_limits;
update public.invitations set design = public.ec_story_design(design) where design is distinct from public.ec_story_design(design);
alter table public.invitations enable trigger enforce_plan_limits;
alter table public.invitations alter column design set default 'mughal-arch';

update public.plans set allowed_designs = (select array_agg(distinct public.ec_story_design(x)) from unnest(allowed_designs) x)
  where allowed_designs is not null;
update public.profiles set allowed_designs = (select array_agg(distinct public.ec_story_design(x)) from unnest(allowed_designs) x)
  where allowed_designs is not null;

drop function public.ec_story_design(text);
