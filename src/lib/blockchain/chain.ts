import { defineChain } from "viem";
import { getEnv } from "@/config/env";
export function robinhoodChain(){const e=getEnv();return defineChain({id:e.ROBINHOOD_CHAIN_ID,name:e.ROBINHOOD_CHAIN_NAME,nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:{default:{http:[e.ROBINHOOD_RPC_URL]}},blockExplorers:{default:{name:"Robinhood Explorer",url:e.ROBINHOOD_EXPLORER_URL}}})}
export function explorerAddress(address:string){return `${getEnv().ROBINHOOD_EXPLORER_URL}/address/${address}`}
export function explorerTx(hash:string){return `${getEnv().ROBINHOOD_EXPLORER_URL}/tx/${hash}`}
