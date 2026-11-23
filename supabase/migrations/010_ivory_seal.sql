-- Eternal Chapter – add the Ivory Seal template to every plan and couple that has a template list.
update public.plans set allowed_designs = array_append(allowed_designs, 'ivory-seal')
  where allowed_designs is not null and not ('ivory-seal' = any (allowed_designs));
update public.profiles set allowed_designs = array_append(allowed_designs, 'ivory-seal')
  where allowed_designs is not null and not ('ivory-seal' = any (allowed_designs));
