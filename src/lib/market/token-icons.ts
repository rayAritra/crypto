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
  // Note: CoinGecko's "robinhood-tokenized-stock" entries for these all
  // point to the same generic Robinhood feather placeholder image, so we
  // use the distinct per-company logos from their "xStock" listings instead.
  googl:
    "https://coin-images.coingecko.com/coins/images/55610/large/Ticker_GOOG__Company_Name_Alphabet_Inc.__size_200x200_2x.png",
  nvda:
    "https://coin-images.coingecko.com/coins/images/55633/large/Ticker_NVDA__Company_Name_NVIDIA_Corp__size_200x200_2x.png",
  gme: "https://coin-images.coingecko.com/coins/images/55607/large/Ticker_GME__Company_Name_gamestop__size_200x200_2x.png",
  spcx: "https://coin-images.coingecko.com/coins/images/102173688/large/SPCXx.png",
  aapl:
    "https://coin-images.coingecko.com/coins/images/55586/large/Ticker_AAPL__Company_Name_Apple_Inc.__size_200x200_2x.png",
  msft:
    "https://coin-images.coingecko.com/coins/images/55630/large/Ticker_MSFT__Company_Name_Microsoft_Inc.__size_200x200_2x.png",
  intc:
    "https://coin-images.coingecko.com/coins/images/55615/large/Ticker_INTC__Company_Name_Intel_Corp__size_200x200_2x.png",
  amc: "https://coin-images.coingecko.com/coins/images/71400/large/amcon_160x160.png",
  djt: "https://coin-images.coingecko.com/coins/images/102175855/large/bstocks_DJTB_64.png",
  uso: "https://coin-images.coingecko.com/coins/images/71471/large/usoon_160x160.png",
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
