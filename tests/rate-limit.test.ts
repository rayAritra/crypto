import {describe,it,expect} from "vitest";
import {rateLimit} from "@/lib/rate-limit";
describe("rate limiter",()=>{it("allows the limit and then rejects",()=>{const key=`test-${Date.now()}`;expect(rateLimit(key,2)).toBe(true);expect(rateLimit(key,2)).toBe(true);expect(rateLimit(key,2)).toBe(false)})})
