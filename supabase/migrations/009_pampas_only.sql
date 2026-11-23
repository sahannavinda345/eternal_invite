-- Eternal Chapter – Pampas Emboss is the only template for now.
alter table public.invitations disable trigger enforce_plan_limits;
update public.invitations set design = 'pampas-emboss' where design <> 'pampas-emboss';
alter table public.invitations enable trigger enforce_plan_limits;
alter table public.invitations alter column design set default 'pampas-emboss';
update public.plans set allowed_designs = array['pampas-emboss'] where allowed_designs is not null;
update public.profiles set allowed_designs = array['pampas-emboss'] where allowed_designs is not null;
