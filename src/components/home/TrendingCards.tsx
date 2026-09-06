import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { RankedToken } from "@/types/token";
import { compactNumber } from "@/lib/utils/format";
import { TokenAvatar } from "@/components/shared/TokenAvatar";

export function TrendingCards({ tokens }: { tokens: RankedToken[] }) {
  if (!tokens.length) return <div className="panel empty"><span>Trending cards will appear as indexed activity becomes available.</span></div>;
  return <div className="trend-grid">{tokens.slice(0, 3).map((item, index) => {
    const change = item.metrics?.priceChange24h;
    return <Link href={`/token/${item.token.address}`} className="trend-card panel" key={item.token.address}>
      <div className="trend-top">
        <TokenAvatar address={item.token.address} symbol={item.token.symbol}/>
        <span><strong>{item.token.symbol}</strong><small>{item.token.name}</small></span>
        <em>0{index + 1}</em>
      </div>
      <div className="trend-price">
        <span><small>Current price</small><strong>{compactNumber(item.metrics?.priceUsd, true)}</strong></span>
        <b className={change != null && change < 0 ? "negative" : "positive"}>{change == null ? "—" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`}</b>
      </div>
      <dl>
        <div><dt>24h volume</dt><dd>{compactNumber(item.metrics?.volume24hUsd, true)}</dd></div>
        <div><dt>Liquidity</dt><dd>{compactNumber(item.metrics?.liquidityUsd, true)}</dd></div>
        <div><dt>Risk score</dt><dd>{item.risk?.score ?? "—"}<small>/100</small></dd></div>
      </dl>
      <span className="trend-open" aria-hidden="true"><ArrowUpRight size={17}/></span>
    </Link>;
  })}</div>;
}
