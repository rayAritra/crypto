# HoodLens


Production-oriented Robinhood Chain token intelligence built with Next.js, viem, Supabase, GeckoTerminal, and Blockscout. It reads ERC-20 metadata directly from the configured chain; unavailable indexed analytics are never fabricated.

## Architecture and features

The App Router UI calls validated, rate-limited route handlers. `TokenService` checks bytecode, independently reads ERC-20 methods, consults optional Supabase caching, requests legitimate market data through `MarketDataProvider`, calculates a deterministic risk score, then persists snapshots. Supabase stores tokens, metric history, holders, transactions, risk snapshots, and rankings. RLS allows public reads and denies browser writes by omission; all ingestion uses the server-only service role.

Included: address search, live contract metadata, price/liquidity/volume and pool aggregation, OHLCV charts, holder concentration, paginated holders and transfers, responsive token and discovery views, transparent risk deductions, copy/explorer UX, standardized API errors, health endpoint, distributed database rate limiting, security headers, protected Vercel Cron discovery/refresh, SEO routes, tests, and migrations.

The `/access` utility layer uses the browser's injected EIP-1193 wallet directly through `viem`; no WalletConnect project or paid wallet API is required. Token discovery remains free. Setting only `NEXT_PUBLIC_HOODLENS_TOKEN_ADDRESS` enables wallet balance reads and Sentinel holder access (one token by default). Paid creator launch passes and analytics credits remain disabled until the recipient, prices, and database are configured.

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Required: `ROBINHOOD_RPC_URL`, `ROBINHOOD_CHAIN_ID`, `ROBINHOOD_CHAIN_NAME`, and `ROBINHOOD_EXPLORER_URL`. Verify the current official Robinhood chain ID and explorer for the network you target. `NEXT_PUBLIC_APP_URL` controls canonical URLs.

For persistence, create a Supabase project and apply every file under `supabase/migrations` using the Supabase CLI (`supabase db push`), then set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service role value through a `NEXT_PUBLIC_` variable. GeckoTerminal defaults to its verified `robinhood` network, while Blockscout defaults to Robinhood's official explorer API. Set a strong `CRON_SECRET`; Vercel sends it as a bearer token to the configured ten-minute cron route.

For launch-day holder utility, set `NEXT_PUBLIC_HOODLENS_TOKEN_ADDRESS` to the live ERC-20 contract address. The token address, symbol, decimals, and optional holder threshold are public configuration, not secrets. Token discovery and free research work without a token address. To enable paid utility later, also set `NEXT_PUBLIC_HOODLENS_PAYMENT_RECIPIENT`, `NEXT_PUBLIC_HOODLENS_LAUNCH_PRICE`, `NEXT_PUBLIC_HOODLENS_CREDIT_PRICE`, and the Supabase variables, then apply migration `0004_hoodlens_utility.sql`. Test the complete payment flow on Robinhood Chain testnet before switching the chain ID, RPC, explorer, token, and recipient to mainnet. A successful ERC-20 transfer is credited only after the configured confirmation count, and each transaction hash can be recorded once.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Deployment

Import the repository into Vercel, configure the variables above for Production, apply the database migration, and deploy. Use a Node.js runtime supported by the selected Next.js release. Check `/api/health` after deployment. Provider credentials stay in route/server modules.

Production readiness requires a random `CRON_SECRET` of at least 32 characters. Configure the same value for Vercel Cron authorization. The per-instance Blockscout API may challenge server-originated requests; configure `BLOCKSCOUT_API_KEY` (or a production Blockscout API endpoint that accepts server traffic) and confirm that `/api/health` reports every service as `operational`. A `degraded` health response is intentionally HTTP 503 and must block deployment promotion.

## Methodology

Risk starts at 100 and deducts only from available objective inputs: holder concentration, very low liquidity, incomplete metadata, and extreme trading imbalance. First-seen time is not treated as on-chain token age. The UI lists every deduction and never labels assets safe or scams. Trending uses log-normalized volume (30%), transaction activity (25%), holder growth (20%), liquidity (15%), and momentum (10%), preventing one raw metric from dominating.

## Known limitations

GeckoTerminal and Blockscout are third-party public services and can rate-limit or deny requests; every section degrades to an explicit unavailable state. Blockscout transfers remain `TRANSFER` unless a DEX source supplies authoritative trade direction. Holder methodology excludes only zero/burn addresses and contracts confidently labeled as pools or pairs. The Supabase limiter falls back to a per-instance limiter if migration `0003_rate_limits.sql` has not been applied. Cron discovers tokens from GeckoTerminal pool discovery rather than synchronously scanning the entire chain.

Recommended next steps are a dedicated event indexer/worker, durable distributed rate limiting, provider-specific holder and transaction adapters, price-candle ingestion, and browser-level accessibility tests.
