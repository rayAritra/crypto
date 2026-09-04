import "server-only";
import { formatUnits } from "viem";
import { getEnv } from "@/config/env";
import type { Holder,HolderSummary,Transaction } from "@/types/token";

type AddressInfo={hash:string;is_contract?:boolean;name?:string|null};
type HolderItem={address:AddressInfo;value:string};
type TransferItem={from?:AddressInfo;to?:AddressInfo;timestamp:string;transaction_hash:string;total?:{decimals?:string;value?:string}};
type Page<T>={items?:T[];next_page_params?:Record<string,string|number>|null};
export type IndexedPage<T>={items:T[];nextCursor:string|null};

export class BlockscoutProvider{
 async holderData(address:string,totalSupply:string):Promise<{summary:HolderSummary|null;holders:Holder[]}>{
  try{const [token,page]=await Promise.all([getJson<Record<string,unknown>>(`/tokens/${address}`),this.holders(address,null)]);const count=number(token?.holders_count);const eligible=page.items.filter(h=>!isExcluded(h));const withPercent=eligible.map(h=>({...h,percentage:percent(h.balance,totalSupply)}));return {summary:{holderCount:count,topHolderPercentage:withPercent[0]?.percentage??null,top10Percentage:withPercent.slice(0,10).reduce((sum,h)=>sum+h.percentage,0)||null,source:"Robinhood Blockscout"},holders:withPercent}}catch(error){log(error,"holders");return{summary:null,holders:[]}}
 }
 async holders(address:string,cursor:string|null):Promise<IndexedPage<Holder>>{const body=await getJson<Page<HolderItem>>(`/tokens/${address}/holders${query(cursor)}`);return{items:(body?.items??[]).map(item=>({address:item.address.hash,balance:item.value,percentage:0,isContract:Boolean(item.address.is_contract),label:item.address.name??null})),nextCursor:encode(body?.next_page_params)}}
 async transfers(address:string,cursor:string|null):Promise<IndexedPage<Transaction>>{try{const body=await getJson<Page<TransferItem>>(`/tokens/${address}/transfers${query(cursor)}`);const explorer=getEnv().ROBINHOOD_EXPLORER_URL;return{items:(body?.items??[]).map(item=>({hash:item.transaction_hash,type:"TRANSFER" as const,wallet:item.from?.hash??item.to?.hash??null,tokenAmount:item.total?.value&&item.total.decimals?formatUnits(BigInt(item.total.value),Number(item.total.decimals)):item.total?.value??null,usdAmount:null,timestamp:item.timestamp,explorerUrl:`${explorer}/tx/${item.transaction_hash}`})),nextCursor:encode(body?.next_page_params)}}catch(error){log(error,"transfers");return{items:[],nextCursor:null}}
 }
}

async function getJson<T>(path:string):Promise<T|null>{const base=getEnv().BLOCKSCOUT_API_URL;for(let attempt=0;attempt<3;attempt++){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);try{const response=await fetch(`${base}${path}`,{headers:{Accept:"application/json"},signal:controller.signal,next:{revalidate:60}});if(response.ok)return await response.json() as T;if(response.status!==429&&response.status<500)return null;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,250*2**attempt))}catch(error){if(attempt===2)throw error}finally{clearTimeout(timer)}}return null}
function encode(value:Record<string,string|number>|null|undefined){return value?Buffer.from(JSON.stringify(value)).toString("base64url"):null}
function query(cursor:string|null){if(!cursor)return"";try{const value=JSON.parse(Buffer.from(cursor,"base64url").toString()) as Record<string,unknown>;const allowed=new Set(["value","address_hash","items_count","block_number","index","filter","type"]);const params=new URLSearchParams();for(const [key,item] of Object.entries(value))if(allowed.has(key)&&(typeof item==="string"||typeof item==="number"))params.set(key,String(item));return`?${params}`}catch{return""}}
function isExcluded(holder:Holder){const lower=holder.address.toLowerCase();return lower==="0x0000000000000000000000000000000000000000"||lower==="0x000000000000000000000000000000000000dead"||Boolean(holder.isContract&&holder.label&&/(pool|pair)/i.test(holder.label))}
function percent(balance:string,supply:string){try{return Number(BigInt(balance)*1000000n/BigInt(supply))/10000}catch{return 0}}
function number(value:unknown){const parsed=Number(value);return Number.isFinite(parsed)?parsed:null}
function log(error:unknown,operation:string){console.error(JSON.stringify({event:"indexer_error",provider:"blockscout",operation,message:error instanceof Error?error.message:"unknown"}))}
