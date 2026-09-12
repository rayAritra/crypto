import { hoodLensAmounts, hoodLensToken } from "@/config/hoodlens-token";
import { rpcClient } from "@/lib/blockchain/client";
import { db } from "@/lib/db/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { sumMatchingTransfers } from "@/lib/payments/verify";
import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress, isHash } from "viem";
import { z } from "zod";

const bodySchema = z.object({
  hash: z.string().refine(isHash, "Invalid transaction hash"),
  address: z.string().refine(isAddress, "Invalid wallet address"),
  purpose: z.enum(["launch", "credits"]),
});

export async function POST(request: NextRequest) {
  if (!(await rateLimit(`payment:${request.headers.get("x-forwarded-for") ?? "local"}`, 12))) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many verification attempts." } },
      { status: 429 },
    );
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message || "Invalid request." } },
      { status: 400 },
    );
  }
  const database = db();
  if (!database) {
    return NextResponse.json(
      { error: { code: "DATABASE_REQUIRED", message: "Payments are unavailable until the database migration is applied." } },
      { status: 503 },
    );
  }
  if (!hoodLensToken.address || !hoodLensToken.recipient) {
    return NextResponse.json(
      { error: { code: "NOT_CONFIGURED", message: "HoodLens token payments are not configured." } },
      { status: 503 },
    );
  }

  const required = hoodLensAmounts[parsed.data.purpose];
  if (required <= 0n) {
    return NextResponse.json(
      { error: { code: "NOT_CONFIGURED", message: "The selected product price is not configured." } },
      { status: 503 },
    );
  }

  try {
    const client = rpcClient();
    const receipt = await client.getTransactionReceipt({ hash: parsed.data.hash });
    if (receipt.status !== "success") throw new Error("Transaction was not successful.");
    const latest = await client.getBlockNumber();
    const confirmations = latest - receipt.blockNumber + 1n;
    if (confirmations < BigInt(hoodLensToken.confirmations)) {
      return NextResponse.json(
        { error: { code: "CONFIRMING", message: "Transaction is still confirming. Try again shortly." } },
        { status: 409 },
      );
    }

    const payer = getAddress(parsed.data.address);
    const recipient = hoodLensToken.recipient;
    const paid = sumMatchingTransfers(
      receipt.logs,
      hoodLensToken.address,
      payer,
      recipient,
    );
    if (paid < required) throw new Error("Transaction does not contain the required HoodLens token payment.");

    const credits = parsed.data.purpose === "credits" ? hoodLensToken.creditsPerPayment : 0;
    const launchCredits = parsed.data.purpose === "launch" ? 1 : 0;
    const { data, error } = await database.rpc("record_hoodlens_payment", {
      p_tx_hash: parsed.data.hash.toLowerCase(),
      p_chain_id: hoodLensToken.chainId,
      p_payer_address: payer.toLowerCase(),
      p_token_address: hoodLensToken.address.toLowerCase(),
      p_recipient_address: recipient.toLowerCase(),
      p_amount_raw: paid.toString(),
      p_purpose: parsed.data.purpose,
      p_credits: credits,
      p_launch_credits: launchCredits,
      p_block_number: receipt.blockNumber.toString(),
    });
    if (error) throw new Error("Could not record the verified payment.");
    if (data !== true) {
      return NextResponse.json(
        { error: { code: "ALREADY_RECORDED", message: "This transaction has already been credited." } },
        { status: 409 },
      );
    }
    return NextResponse.json({ data: { hash: parsed.data.hash, purpose: parsed.data.purpose, credits, launchCredits } });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "PAYMENT_INVALID", message: error instanceof Error ? error.message : "Payment verification failed." } },
      { status: 400 },
    );
  }
}
