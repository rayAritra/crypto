import "server-only";
import type { LiquidityPool,MarketData,PricePoint } from "@/types/token";
import { getEnv } from "@/config/env";

type PoolResource={attributes:{address:string;name:string;pool_created_at?:string;token_price_usd?:string;fdv_usd?:string;market_cap_usd?:string;price_change_percentage?:{h24?:string};transactions?:{h24?:{buys?:number;sells?:number}};volume_usd?:{h24?:string};reserve_in_usd?:string};relationships?:{dex?:{data?:{id?:string}}}};
type Ohlcv={data?:{attributes?:{ohlcv_list?:[number,number,number,number,number,number][]}}};
export interface MarketResult{metrics:MarketData|null;pools:LiquidityPool[];priceHistory:PricePoint[]}
export interface MarketDataProvider{getTokenMarketData(address:string):Promise<MarketResult>}

export class GeckoTerminalProvider implements MarketDataProvider{
 async getTokenMarketData(address:string):Promise<MarketResult>{
  const e=getEnv();
  try{
   const response=await request(`${e.INDEXER_BASE_URL}/networks/${encodeURIComponent(e.INDEXER_CHAIN_ID)}/tokens/${address}/pools?page=1`);
   if(!response)return empty();
   const body=await response.json() as {data?:PoolResource[]};
   const resources=body.data??[];
   const sorted=[...resources].sort((a,b)=>(numeric(b.attributes.reserve_in_usd)??0)-(numeric(a.attributes.reserve_in_usd)??0));
   const primary=sorted[0];if(!primary)return empty();
   const pools=sorted.map(p=>({address:p.attributes.address,name:p.attributes.name,dex:p.relationships?.dex?.data?.id??"Unknown DEX",liquidityUsd:numeric(p.attributes.reserve_in_usd),volume24hUsd:numeric(p.attributes.volume_usd?.h24),createdAt:p.attributes.pool_created_at??null}));
   const liquidity=resources.reduce((sum,p)=>sum+(numeric(p.attributes.reserve_in_usd)??0),0);
   const volume=resources.reduce((sum,p)=>sum+(numeric(p.attributes.volume_usd?.h24)??0),0);
   const buys=resources.reduce((sum,p)=>sum+(p.attributes.transactions?.h24?.buys??0),0);
   const sells=resources.reduce((sum,p)=>sum+(p.attributes.transactions?.h24?.sells??0),0);
   const metrics:MarketData={priceUsd:numeric(primary.attributes.token_price_usd),marketCapUsd:numeric(primary.attributes.market_cap_usd),fdvUsd:numeric(primary.attributes.fdv_usd),liquidityUsd:liquidity||null,volume24hUsd:volume||null,priceChange24h:numeric(primary.attributes.price_change_percentage?.h24),buys24h:buys||null,sells24h:sells||null,pairAddress:primary.attributes.address,dex:primary.relationships?.dex?.data?.id??null,source:"GeckoTerminal",capturedAt:new Date().toISOString()};
   return {metrics,pools,priceHistory:await this.history(primary.attributes.address)};
  }catch(error){console.error(JSON.stringify({event:"market_provider_error",provider:"geckoterminal",message:error instanceof Error?error.message:"unknown"}));return empty()}
 }
 private async history(pool:string){const e=getEnv();const response=await request(`${e.INDEXER_BASE_URL}/networks/${encodeURIComponent(e.INDEXER_CHAIN_ID)}/pools/${pool}/ohlcv/hour?aggregate=1&limit=168`);if(!response)return[];const body=await response.json() as Ohlcv;return (body.data?.attributes?.ohlcv_list??[]).map(row=>({timestamp:row[0]*1000,price:row[4]})).reverse()}
 async discoverAddresses(kind:"new"|"trending"){const e=getEnv();const endpoint=kind==="new"?"new_pools":"trending_pools";const response=await request(`${e.INDEXER_BASE_URL}/networks/${encodeURIComponent(e.INDEXER_CHAIN_ID)}/${endpoint}?page=1`);if(!response)return[];const body=await response.json() as {data?:Array<{relationships?:{base_token?:{data?:{id?:string}},quote_token?:{data?:{id?:string}}}}>};const prefix=`${e.INDEXER_CHAIN_ID}_`;return [...new Set((body.data??[]).flatMap(pool=>[pool.relationships?.base_token?.data?.id,pool.relationships?.quote_token?.data?.id]).filter((id):id is string=>Boolean(id?.startsWith(prefix))).map(id=>id.slice(prefix.length)))].slice(0,20)}
}

async function request(url:string){for(let attempt=0;attempt<3;attempt++){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7000);try{const response=await fetch(url,{headers:{Accept:"application/json"},signal:controller.signal,next:{revalidate:60}});if(response.ok)return response;if(response.status!==429&&response.status<500)return null;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,250*2**attempt))}catch(error){if(attempt===2)throw error}finally{clearTimeout(timer)}}return null}
function numeric(value:unknown){if(value==null||value==="")return null;const number=Number(value);return Number.isFinite(number)?number:null}
function empty():MarketResult{return{metrics:null,pools:[],priceHistory:[]}}
