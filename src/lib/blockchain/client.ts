import "server-only";
import { createPublicClient,http } from "viem"; import { robinhoodChain } from "./chain";
export function rpcClient(){const chain=robinhoodChain();return createPublicClient({chain,transport:http(chain.rpcUrls.default.http[0],{timeout:8000,retryCount:2,retryDelay:300})})}
