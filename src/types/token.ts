export type Token = { address:string; name:string; symbol:string; decimals:number; totalSupply:string; chainId:number; firstSeenAt:string; explorerUrl:string };
export type MarketData = { priceUsd:number|null; marketCapUsd:number|null; fdvUsd:number|null; liquidityUsd:number|null; volume24hUsd:number|null; priceChange24h:number|null; buys24h:number|null; sells24h:number|null; pairAddress:string|null; dex:string|null; source:string; capturedAt:string };
export type HolderSummary = { holderCount:number|null; topHolderPercentage:number|null; top10Percentage:number|null; source?:string };
export type RiskDeduction = { label:string; points:number; detail:string };
export type Risk = { score:number; level:string; deductions:RiskDeduction[]; calculatedAt:string };
export type TokenAnalytics = { token:Token; metrics:MarketData|null; holderSummary:HolderSummary|null; risk:Risk; transactions:Transaction[]; lastUpdated:string };
export type Transaction = { hash:string; type:"BUY"|"SELL"|"TRANSFER"; wallet:string|null; tokenAmount:string|null; usdAmount:number|null; timestamp:string; explorerUrl:string };
export type RankedToken = { token:Token; metrics:MarketData|null; risk:Risk|null };
