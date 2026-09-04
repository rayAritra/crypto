-- PostgREST may serialize very large numeric values as JavaScript numbers.
-- Store the ERC-20 raw uint256 as decimal text so API consumers retain every digit.
alter table public.tokens
  alter column total_supply type text using total_supply::text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'tokens_total_supply_digits') then
    alter table public.tokens add constraint tokens_total_supply_digits check(total_supply ~ '^[0-9]+$');
  end if;
end $$;
