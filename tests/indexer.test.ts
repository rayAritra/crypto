import { isExcludedHolder } from "@/lib/blockchain/indexer";
import type { Holder } from "@/types/token";
import { describe, expect, it } from "vitest";

const tokenAddress = "0x6d7400000000000000000000000000000000ebf5";

function holder(overrides: Partial<Holder> = {}): Holder {
  return {
    address: "0xda4b000000000000000000000000000000003968",
    balance: "100",
    percentage: 0,
    isContract: false,
    label: null,
    ...overrides,
  };
}

describe("holder exclusions", () => {
  it("excludes the analyzed token contract from concentration", () => {
    expect(
      isExcludedHolder(
        holder({ address: tokenAddress.toUpperCase(), isContract: true }),
        tokenAddress,
      ),
    ).toBe(true);
  });

  it("keeps unrelated contracts unless they are identified as pools", () => {
    expect(isExcludedHolder(holder({ isContract: true }), tokenAddress)).toBe(
      false,
    );
    expect(
      isExcludedHolder(
        holder({ isContract: true, label: "Pons V2 Pair" }),
        tokenAddress,
      ),
    ).toBe(true);
  });

  it("continues to exclude zero and burn addresses", () => {
    expect(
      isExcludedHolder(
        holder({ address: "0x0000000000000000000000000000000000000000" }),
        tokenAddress,
      ),
    ).toBe(true);
    expect(
      isExcludedHolder(
        holder({ address: "0x000000000000000000000000000000000000dEaD" }),
        tokenAddress,
      ),
    ).toBe(true);
  });
});
