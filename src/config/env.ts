import "server-only";
import { z } from "zod";

const schema = z.object({
  ROBINHOOD_NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),
  ROBINHOOD_RPC_URL: z.string().url().default("https://rpc.mainnet.chain.robinhood.com"),
  ROBINHOOD_CHAIN_ID: z.coerce.number().int().positive().default(4663),
  ROBINHOOD_CHAIN_NAME: z.string().default("Robinhood Chain"),
  ROBINHOOD_EXPLORER_URL: z.string().url().default("https://robinhoodchain.blockscout.com"),
  SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  INDEXER_BASE_URL: z.string().url().default("https://api.geckoterminal.com/api/v2"),
  INDEXER_CHAIN_ID: z.string().default("robinhood"),
  INDEXER_API_KEY: z.string().optional(),
  BLOCKSCOUT_API_URL: z.string().url().default("https://robinhoodchain.blockscout.com/api/v2"),
  BLOCKSCOUT_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(32).optional().or(z.literal("")),
}).superRefine((value, context) => {
  const expected = value.ROBINHOOD_NETWORK === "mainnet" ? 4663 : 46630;
  if (value.ROBINHOOD_CHAIN_ID !== expected) context.addIssue({ code: "custom", path: ["ROBINHOOD_CHAIN_ID"], message: `must be ${expected} for ${value.ROBINHOOD_NETWORK}` });
});

export type ServerEnv = z.infer<typeof schema>;
export function getEnv(): ServerEnv { const result = schema.safeParse(process.env); if (!result.success) throw new Error(`Invalid server configuration: ${result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join(", ")}`); return result.data; }
export function hasDatabase() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY); }
