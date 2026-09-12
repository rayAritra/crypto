create table hoodlens_payments (
  tx_hash text primary key check (tx_hash = lower(tx_hash)),
  chain_id bigint not null,
  payer_address text not null check (payer_address = lower(payer_address)),
  token_address text not null check (token_address = lower(token_address)),
  recipient_address text not null check (recipient_address = lower(recipient_address)),
  amount_raw text not null check (amount_raw ~ '^[0-9]+$'),
  purpose text not null check (purpose in ('launch', 'credits')),
  credits_granted integer not null default 0 check (credits_granted >= 0),
  launch_credits_granted integer not null default 0 check (launch_credits_granted >= 0),
  block_number text not null check (block_number ~ '^[0-9]+$'),
  confirmed_at timestamptz not null default now()
);

create index hoodlens_payments_wallet
  on hoodlens_payments (payer_address, confirmed_at desc);

create table hoodlens_entitlements (
  wallet_address text primary key check (wallet_address = lower(wallet_address)),
  credits bigint not null default 0 check (credits >= 0),
  launch_credits integer not null default 0 check (launch_credits >= 0),
  updated_at timestamptz not null default now()
);

alter table hoodlens_payments enable row level security;
alter table hoodlens_entitlements enable row level security;
revoke all on hoodlens_payments, hoodlens_entitlements from anon, authenticated;
grant all on hoodlens_payments, hoodlens_entitlements to service_role;

create or replace function record_hoodlens_payment(
  p_tx_hash text,
  p_chain_id bigint,
  p_payer_address text,
  p_token_address text,
  p_recipient_address text,
  p_amount_raw text,
  p_purpose text,
  p_credits integer,
  p_launch_credits integer,
  p_block_number text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
begin
  insert into hoodlens_payments (
    tx_hash, chain_id, payer_address, token_address, recipient_address,
    amount_raw, purpose, credits_granted, launch_credits_granted, block_number
  ) values (
    lower(p_tx_hash), p_chain_id, lower(p_payer_address), lower(p_token_address),
    lower(p_recipient_address), p_amount_raw, p_purpose, p_credits,
    p_launch_credits, p_block_number
  ) on conflict (tx_hash) do nothing;

  get diagnostics inserted_count = row_count;
  if inserted_count = 0 then return false; end if;

  insert into hoodlens_entitlements (
    wallet_address, credits, launch_credits, updated_at
  ) values (
    lower(p_payer_address), p_credits, p_launch_credits, now()
  ) on conflict (wallet_address) do update set
    credits = hoodlens_entitlements.credits + excluded.credits,
    launch_credits = hoodlens_entitlements.launch_credits + excluded.launch_credits,
    updated_at = now();

  return true;
end;
$$;

revoke all on function record_hoodlens_payment(
  text, bigint, text, text, text, text, text, integer, integer, text
) from public, anon, authenticated;
grant execute on function record_hoodlens_payment(
  text, bigint, text, text, text, text, text, integer, integer, text
) to service_role;
