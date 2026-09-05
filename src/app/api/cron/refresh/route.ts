import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/config/env";import { recalculateRankings, staleTokenAddresses } from "@/lib/db/queries";import { TokenService } from "@/lib/blockchain/token-service";import { GeckoTerminalProvider } from "@/lib/market/provider";

export const maxDuration = 300;
async function refresh(req: NextRequest) {
  const secret = getEnv().CRON_SECRET;
  if (!secret) return NextResponse.json({ error: { code: "CRON_NOT_CONFIGURED", message: "Refresh jobs are not configured." } }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  const provider = new GeckoTerminalProvider(), [stale, discovered] = await Promise.all([staleTokenAddresses(), provider.discoverAddresses("new")]), addresses = [...new Set([...discovered, ...stale])].slice(0, 25), results: PromiseSettledResult<unknown>[] = [];
  // One token at a time keeps the three Blockscout detail requests below the free 5 RPS tier.
  for (const address of addresses) {
    try { results.push({ status: "fulfilled", value: await new TokenService().get(address) }); }
    catch (reason) { results.push({ status: "rejected", reason }); }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  await recalculateRankings();
  return NextResponse.json({ status: "complete", examined: addresses.length, discovered: discovered.length, refreshed: results.filter(result => result.status === "fulfilled").length, failed: results.filter(result => result.status === "rejected").length });
}
export const GET = refresh;export const POST = refresh;
