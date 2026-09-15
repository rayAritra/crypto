import { hoodLensAmounts, hoodLensPaymentsEnabled, hoodLensToken } from "@/config/hoodlens-token";
import { rpcClient } from "@/lib/blockchain/client";
import { db } from "@/lib/db/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { erc20Abi, formatUnits, getAddress, isAddress } from "viem";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: { code: "INVALID_ADDRESS", message: "A valid wallet address is required." } },
      { status: 400 },
    );
  }
  if (!(await rateLimit(`access:${address.toLowerCase()}`, 30))) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests." } },
      { status: 429 },
    );
  }

  const client = db();
  const configured = Boolean(hoodLensToken.address);
  let balance = 0n;
  if (hoodLensToken.address) {
    try {
      balance = await rpcClient().readContract({
        address: hoodLensToken.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [getAddress(address)],
      });
    } catch {
      return NextResponse.json(
        { error: { code: "RPC_UNAVAILABLE", message: "Token balance is temporarily unavailable." } },
        { status: 503 },
      );
    }
  }

  let credits = 0;
  let launchCredits = 0;
  if (client) {
    const { data } = await client
      .from("hoodlens_entitlements")
      .select("credits,launch_credits")
      .eq("wallet_address", address.toLowerCase())
      .maybeSingle();
    credits = Number(data?.credits ?? 0);
    launchCredits = Number(data?.launch_credits ?? 0);
  }

  return NextResponse.json(
    {
      data: {
        configured,
        paymentsEnabled: hoodLensPaymentsEnabled && Boolean(client),
        databaseReady: Boolean(client),
        address: getAddress(address),
        symbol: hoodLensToken.symbol,
        balanceRaw: balance.toString(),
        balance: formatUnits(balance, hoodLensToken.decimals),
        premium: hoodLensAmounts.premium > 0n && balance >= hoodLensAmounts.premium,
        credits,
        launchCredits,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
