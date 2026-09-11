import { TokenAvatar } from "@/components/shared/TokenAvatar";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("TokenAvatar", () => {
  it("renders builtin SVG for Robinhood chain tokens", () => {
    const { container } = render(
      <TokenAvatar
        symbol="$HOOD"
        address="0x71c5000000000000000000000000000000004490"
        size={28}
      />,
    );
    const span = container.querySelector("span.token-avatar");
    expect(span).toBeTruthy();
    expect(span?.getAttribute("style")).toContain("width: 28px");
    expect(span?.getAttribute("style")).toContain("height: 28px");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders builtin SVG for major crypto tokens like ETH", () => {
    const { container } = render(<TokenAvatar symbol="WETH" size={24} />);
    const span = container.querySelector("span.token-avatar");
    expect(span).toBeTruthy();
    expect(span?.getAttribute("style")).toContain("width: 24px");
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders styled initials avatar when token is unknown and CDNs fail", () => {
    const { container } = render(
      <TokenAvatar
        symbol="$UNKNOWNXYZ"
        address="0x1234567890abcdef"
        size={32}
      />,
    );
    const span = container.querySelector("span.token-avatar");
    expect(span).toBeTruthy();
    expect(span?.getAttribute("style")).toContain("width: 32px");
  });

  it("renders verified CoinGecko image for USDG instead of broken spothq jsdelivr", () => {
    const { container } = render(
      <TokenAvatar
        symbol="USDG"
        address="0x5fc5360d0400a0fd4f2af552add042d716f1d168"
        size={24}
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toContain("coin-images.coingecko.com");
    expect(img?.getAttribute("src")).not.toContain("spothq");
  });

  it("prioritizes explicit iconUrl prop when provided", () => {
    const customUrl = "https://custom-cdn.example.com/icons/token.png";
    const { container } = render(
      <TokenAvatar symbol="XYZ" iconUrl={customUrl} size={32} />,
    );
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe(customUrl);
  });
});
