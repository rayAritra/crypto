import { TokenView } from "@/components/token/TokenView";
import { shortenAddress } from "@/lib/utils/format";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const short = shortenAddress(address);
  const path = `/token/${address}`;
  const title = `${short} — On-Chain Intelligence`;
  const description = `Real-time liquidity, trade activity, holder concentration, and transparent risk deductions for contract ${address} on Robinhood Chain.`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | HoodLens`,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | HoodLens`,
      description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <main className="w-full max-w-[1580px] mx-auto px-margin-screen site-container py-space-md min-h-[calc(100vh-48px-64px)]">
      <TokenView address={address} />
    </main>
  );
}
