# HoodLens

Production-oriented Robinhood Chain token intelligence built with Next.js, viem, Supabase, and a provider-isolated market-data layer. It reads ERC-20 metadata directly from the configured chain; unavailable indexed analytics are never fabricated.

## Architecture and features

The App Router UI calls validated, rate-limited route handlers. `TokenService` checks bytecode, independently reads ERC-20 methods, consults optional Supabase caching, requests legitimate market data through `MarketDataProvider`, calculates a deterministic risk score, then persists snapshots. Supabase stores tokens, metric history, holders, transactions, risk snapshots, and rankings. RLS allows public reads and denies browser writes by omission; all ingestion uses the server-only service role.

Included: address search, live contract metadata, price/liquidity/volume where the market provider has a pair, responsive token page and discovery table, transparent risk deductions, copy/explorer UX, standardized API errors, health endpoint, security headers, protected cron entrypoint, SEO routes, tests, and complete migrations.

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Required: `ROBINHOOD_RPC_URL`, `ROBINHOOD_CHAIN_ID`, `ROBINHOOD_CHAIN_NAME`, and `ROBINHOOD_EXPLORER_URL`. Verify the current official Robinhood chain ID and explorer for the network you target. `NEXT_PUBLIC_APP_URL` controls canonical URLs.

For persistence, create a Supabase project and apply `supabase/migrations/0001_initial.sql` using the Supabase CLI (`supabase db push`), then set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role value through a `NEXT_PUBLIC_` variable. `INDEXER_BASE_URL` defaults to DexScreener; `INDEXER_API_KEY` is optional. Set a strong `CRON_SECRET` and POST to `/api/cron/refresh` with `Authorization: Bearer <secret>` from Vercel Cron or a worker.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

Import the repository into Vercel, configure the variables above for Production, apply the database migration, and deploy. Use a Node.js runtime supported by the selected Next.js release. Check `/api/health` after deployment. Provider credentials stay in route/server modules.

## Methodology

Risk starts at 100 and deducts only from available objective inputs: holder concentration, very low liquidity, incomplete metadata, and extreme trading imbalance. First-seen time is not treated as on-chain token age. The UI lists every deduction and never labels assets safe or scams. Trending uses log-normalized volume (30%), transaction activity (25%), holder growth (20%), liquidity (15%), and momentum (10%), preventing one raw metric from dominating.

## Known limitations

RPC alone cannot efficiently produce historical prices, complete holders, DEX classifications, or chain-wide new-token discovery. These sections explicitly show unavailable states until a Robinhood-compatible indexer feeds the included tables. DexScreener coverage depends on its current Robinhood Chain support. The in-process rate limiter is a useful per-instance guard; high-scale deployment should replace it with a durable Redis/Vercel KV limiter. The cron endpoint is intentionally a protected architecture seam and does not scan the entire chain synchronously.

Recommended next steps are a dedicated event indexer/worker, durable distributed rate limiting, provider-specific holder and transaction adapters, price-candle ingestion, and browser-level accessibility tests.
