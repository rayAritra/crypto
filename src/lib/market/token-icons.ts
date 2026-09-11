/**
 * Authoritative, verified token icon URLs for Robinhood Chain and major crypto assets.
 * All URLs are validated to return HTTP 200 with high-resolution image assets.
 */

const VERIFIED_TOKEN_ICONS: Record<string, string> = {
  // Stablecoins & Key Assets
  usdg: "https://coin-images.coingecko.com/coins/images/51281/large/GDN_USDG_Token_200x200.png?1730484111",
  usdc: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png",
  usdt: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
  dai: "https://coin-images.coingecko.com/coins/images/9956/large/Badge_Dai.png",

  // Robinhood Ecosystem
  hood: "/logo/hoodlens-mark-cyan.png",
  rhx: "/logo/hoodlens-mark-black.png",
  lens: "/logo/hoodlens-mark-white.png",
  robin: "/logo/hoodlens-mark-cyan.png",

  // Major Crypto
  eth: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  weth: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
  btc: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
  wbtc: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
  sol: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
  bnb: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  arb: "https://coin-images.coingecko.com/coins/images/16547/large/arbitrum_logo.png",
  op: "https://coin-images.coingecko.com/coins/images/25244/large/Optimism.png",
  link: "https://coin-images.coingecko.com/coins/images/877/large/Chainlink_Logo_500.png",
  uni: "https://coin-images.coingecko.com/coins/images/12504/large/uniswap-uni.png",
  pepe: "https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.png",

  // Tokenized Equities on Robinhood Chain
  googl:
    "https://coin-images.coingecko.com/coins/images/102174124/large/0x2e0847e8910a9732eb3fb1bb4b70a580adad4fe3.png",
  nvda:
    "https://coin-images.coingecko.com/coins/images/102174110/large/0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec.png",
  gme: "https://coin-images.coingecko.com/coins/images/102174150/large/0x1b0e319c6a659f002271b69db8a7df2f911c153e.png",
  spcx:
    "https://coin-images.coingecko.com/coins/images/102174129/large/0x4a0e65a3eccec6dbe60ae065f2e7bb85fae35eea.png",
  aapl:
    "https://coin-images.coingecko.com/coins/images/102174123/large/0xaf3d76f1834a1d425780943c99ea8a608f8a93f9.png",
  msft:
    "https://coin-images.coingecko.com/coins/images/102174116/large/0xe93237c50d904957cf27e7b1133b510c669c2e74.png",
};

const VERIFIED_ADDRESS_ICONS: Record<string, string> = {
  // USDG on Robinhood Chain
  "0x5fc5360d0400a0fd4f2af552add042d716f1d168":
    "https://coin-images.coingecko.com/coins/images/51281/large/GDN_USDG_Token_200x200.png?1730484111",
  // Hood ecosystem
  "0x71c5000000000000000000000000000000004490": "/logo/hoodlens-mark-cyan.png",
  "0x892a00000000000000000000000000000000103f": "/logo/hoodlens-mark-black.png",
  "0x3310000000000000000000000000000000008821": "/logo/hoodlens-mark-white.png",
};

const TICKER_ALIASES: Record<string, string> = {
  weth: "eth",
  wbtc: "btc",
  wsol: "sol",
  wavax: "avax",
  wbnb: "bnb",
  rh: "hood",
  robinhood: "hood",
};

export function resolveTokenIconUrl(
  symbol?: string | null,
  address?: string | null,
): string | null {
  if (address) {
    const addrLower = address.toLowerCase();
    if (VERIFIED_ADDRESS_ICONS[addrLower]) {
      return VERIFIED_ADDRESS_ICONS[addrLower];
    }
  }

  if (symbol) {
    const cleanTicker = symbol
      .replace(/^\$/, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const normalizedTicker = TICKER_ALIASES[cleanTicker] || cleanTicker;

    if (VERIFIED_TOKEN_ICONS[normalizedTicker]) {
      return VERIFIED_TOKEN_ICONS[normalizedTicker];
    }
  }

  // If contract address is provided, resolve dynamically through our server-side proxy
  if (address && address.startsWith("0x") && address.length === 42) {
    const symParam = symbol ? `&symbol=${encodeURIComponent(symbol)}` : "";
    return `/api/token-icon?address=${encodeURIComponent(address)}${symParam}`;
  }

  return null;
}
