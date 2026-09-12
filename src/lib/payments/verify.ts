import {
  decodeEventLog,
  erc20Abi,
  getAddress,
  type Address,
  type Hex,
  type Log,
} from "viem";

type PaymentLog = {
  address: Address;
  data: Hex;
  topics: readonly Hex[];
};

export function sumMatchingTransfers(
  logs: readonly PaymentLog[],
  token: Address,
  payer: Address,
  recipient: Address,
) {
  let paid = 0n;
  for (const log of logs) {
    if (getAddress(log.address) !== token) continue;
    try {
      const event = decodeEventLog({
        abi: erc20Abi,
        data: log.data,
        topics: log.topics as Log["topics"],
      });
      if (
        event.eventName === "Transfer" &&
        getAddress(event.args.from) === payer &&
        getAddress(event.args.to) === recipient
      ) {
        paid += event.args.value;
      }
    } catch {
      // A receipt can contain unrelated events from the same transaction.
    }
  }
  return paid;
}
