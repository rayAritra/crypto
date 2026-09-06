import "server-only";
import { getAddress, type Address } from "viem";
import { rpcClient } from "./client";import { erc20Abi } from "./erc20";import { getEnv } from "@/config/env";import { cachedToken, metricHistory, persistToken } from "@/lib/db/queries";import { GeckoTerminalProvider } from "@/lib/market/provider";import { BlockscoutProvider } from "./indexer";import { calculateRisk } from "@/lib/analytics/risk";import type { TokenAnalytics } from "@/types/token";

export class TokenService {
  async get(address: string): Promise<TokenAnalytics> {
    const env = getEnv(), normalized = getAddress(address), client = rpcClient(), started = Date.now();
    const code = await client.getCode({ address: normalized });
    if (!code || code === "0x") throw new ServiceError("CONTRACT_NOT_FOUND", "No contract exists at this address.", 404);
    let token = await cachedToken(normalized, env.ROBINHOOD_CHAIN_ID, env.ROBINHOOD_EXPLORER_URL);
    if (token) {
      const supply = await client.readContract({ address: normalized as Address, abi: erc20Abi, functionName: "totalSupply" });
      token = { ...token, address: normalized, totalSupply: String(supply) };
    } else {
      const calls = await Promise.allSettled([
        client.readContract({ address: normalized as Address, abi: erc20Abi, functionName: "name" }), client.readContract({ address: normalized as Address, abi: erc20Abi, functionName: "symbol" }), client.readContract({ address: normalized as Address, abi: erc20Abi, functionName: "decimals" }), client.readContract({ address: normalized as Address, abi: erc20Abi, functionName: "totalSupply" }),
      ]);
      if (calls[2].status === "rejected" || calls[3].status === "rejected") throw new ServiceError("NOT_ERC20", "The contract does not expose standard ERC-20 supply metadata.", 422);
      const clean = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 100) : fallback;
      token = { address: normalized, name: calls[0].status === "fulfilled" ? clean(calls[0].value, "Unknown Token") : "Unknown Token", symbol: calls[1].status === "fulfilled" ? clean(calls[1].value, "UNKNOWN") : "UNKNOWN", decimals: Number(calls[2].value), totalSupply: String(calls[3].value), chainId: env.ROBINHOOD_CHAIN_ID, firstSeenAt: new Date().toISOString(), explorerUrl: `${env.ROBINHOOD_EXPLORER_URL}/address/${normalized}` };
    }
    const indexer = new BlockscoutProvider();
    const [market, holderData, transferPage] = await Promise.all([
      new GeckoTerminalProvider().getTokenMarketData(normalized), indexer.holderData(normalized, token.totalSupply), indexer.transfers(normalized, null).catch(error => { console.error(JSON.stringify({ event: "indexer_error", provider: "blockscout", operation: "transfers", message: error instanceof Error ? error.message : "unknown" })); return { items: [], nextCursor: null }; }),
    ]);
    const risk = calculateRisk(token, market.metrics, holderData.summary);
    const storedPriceHistory = market.priceHistory.length ? [] : await metricHistory(normalized, env.ROBINHOOD_CHAIN_ID);
    await persistToken(token, market.metrics, risk);
    console.info(JSON.stringify({ event: "token_lookup", address: normalized, latencyMs: Date.now() - started }));
    return { token, metrics: market.metrics, holderSummary: holderData.summary, holders: holderData.holders, pools: market.pools, priceHistory: market.priceHistory.length ? market.priceHistory : storedPriceHistory, risk, transactions: transferPage.items.slice(0, 20), lastUpdated: new Date().toISOString() };
  }
}
export class ServiceError extends Error { constructor(public code: string, message: string, public status: number) { super(message); } }
