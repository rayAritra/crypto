import {describe,it,expect} from "vitest";
import {rateLimit} from "@/lib/rate-limit";
describe("rate limiter",()=>{it("allows the limit and then rejects",async()=>{const key=`test-${Date.now()}`;expect(await rateLimit(key,2)).toBe(true);expect(await rateLimit(key,2)).toBe(true);expect(await rateLimit(key,2)).toBe(false)})})
