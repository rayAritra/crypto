import { getAddress,isAddress } from "viem"; import { z } from "zod";
export const addressSchema=z.string().trim().refine(isAddress,"Enter a valid EVM contract address.").transform(v=>getAddress(v));
export function parseAddress(v:string){return addressSchema.safeParse(v)}
