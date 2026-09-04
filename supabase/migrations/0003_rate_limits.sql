create table if not exists public.api_rate_limits(key text primary key,request_count integer not null,window_started_at timestamptz not null);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon,authenticated;
grant all on public.api_rate_limits to service_role;
create or replace function public.consume_rate_limit(p_key text,p_limit integer,p_window_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$
declare current_count integer;
begin
 insert into public.api_rate_limits(key,request_count,window_started_at) values(p_key,1,now()) on conflict(key) do update set request_count=case when public.api_rate_limits.window_started_at<now()-make_interval(secs=>p_window_seconds) then 1 else public.api_rate_limits.request_count+1 end,window_started_at=case when public.api_rate_limits.window_started_at<now()-make_interval(secs=>p_window_seconds) then now() else public.api_rate_limits.window_started_at end returning request_count into current_count;
 return current_count<=p_limit;
end;$$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
