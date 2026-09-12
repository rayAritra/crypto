import { sumMatchingTransfers } from "@/lib/payments/verify";
import {
  encodeAbiParameters,
  encodeEventTopics,
  erc20Abi,
  getAddress,
  type Address,
  type Hex,
} from "viem";
import { describe, expect, it } from "vitest";

const token = getAddress("0x1111111111111111111111111111111111111111");
const anotherToken = getAddress("0x2222222222222222222222222222222222222222");
const payer = getAddress("0x3333333333333333333333333333333333333333");
const recipient = getAddress("0x4444444444444444444444444444444444444444");
const stranger = getAddress("0x5555555555555555555555555555555555555555");

function transferLog(address: Address, from: Address, to: Address, value: bigint) {
  return {
    address,
    topics: encodeEventTopics({
      abi: erc20Abi,
      eventName: "Transfer",
      args: { from, to },
    }) as readonly Hex[],
    data: encodeAbiParameters([{ type: "uint256" }], [value]),
  };
}

describe("payment transfer verification", () => {
  it("sums multiple matching transfers", () => {
    const paid = sumMatchingTransfers(
      [
        transferLog(token, payer, recipient, 40n),
        transferLog(token, payer, recipient, 60n),
      ],
      token,
      payer,
      recipient,
    );
    expect(paid).toBe(100n);
  });

  it("ignores the wrong token, sender, and recipient", () => {
    const paid = sumMatchingTransfers(
      [
        transferLog(anotherToken, payer, recipient, 100n),
        transferLog(token, stranger, recipient, 100n),
        transferLog(token, payer, stranger, 100n),
      ],
      token,
      payer,
      recipient,
    );
    expect(paid).toBe(0n);
  });
});
