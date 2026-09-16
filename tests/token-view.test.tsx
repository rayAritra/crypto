import { TokenView } from "@/components/token/TokenView";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const addRecent = vi.fn();

vi.mock("@/components/providers/AppState", () => ({
  useAppState: () => ({
    ready: true,
    watchlist: [],
    recent: [],
    compare: [],
    isWatched: () => false,
    toggleWatch: vi.fn(),
    addRecent,
    removeRecent: vi.fn(),
    clearRecent: vi.fn(),
    toggleCompare: vi.fn(),
    removeCompare: vi.fn(),
    clearCompare: vi.fn(),
  }),
}));

vi.mock("@/components/token/PriceChart", () => ({
  PriceChart: () => <div data-testid="price-chart" />,
}));

const firstAddress = "0x0000000000000000000000000000000000000001";
const missingAddress = "0x0000000000000000000000000000000000000002";
const analytics = {
  token: {
    address: firstAddress,
    name: "First Token",
    symbol: "FIRST",
    decimals: 18,
    totalSupply: "1000000000000000000",
    chainId: 4663,
    firstSeenAt: "2026-01-01T00:00:00.000Z",
    explorerUrl: `https://robinhoodchain.blockscout.com/address/${firstAddress}`,
  },
  metrics: null,
  holderSummary: null,
  holders: [],
  pools: [],
  priceHistory: [],
  risk: {
    score: 100,
    level: "Lower Risk Indicators",
    deductions: [],
    calculatedAt: "2026-01-01T00:00:00.000Z",
  },
  transactions: [],
  lastUpdated: "2026-01-01T00:00:00.000Z",
};

describe("TokenView", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    addRecent.mockReset();
  });

  it("replaces stale token data with a Robinhood-specific lookup error", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(analytics), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: "CONTRACT_NOT_FOUND",
              message:
                "No ERC-20 contract was found at this address on Robinhood Chain.",
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const view = render(<TokenView address={firstAddress} />);
    expect(await screen.findByText("First Token")).toBeTruthy();

    view.rerender(<TokenView address={missingAddress} />);

    expect(
      await screen.findByText(
        "No ERC-20 contract was found at this address on Robinhood Chain.",
      ),
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByText("First Token")).toBeNull(),
    );
  });
});
