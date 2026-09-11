import { NextRequest, NextResponse } from "next/server";
import { resolveTokenIconUrl } from "@/lib/market/token-icons";
import { getEnv } from "@/config/env";

const iconCache = new Map<string, string | null>();

// GeckoTerminal/Blockscout fall back to a shared generic icon for tokens
// they haven't indexed metadata for. Serving that would make unrelated
// tokens (e.g. two different tokenized equities) display the same image.
const GENERIC_ICON_PATTERN = /generic|placeholder|default|unknown|missing/i;

function isRealTokenIcon(url: string | null | undefined): url is string {
  return !!url && !GENERIC_ICON_PATTERN.test(url);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.toLowerCase() || null;
  const symbol = searchParams.get("symbol") || null;

  if (!address && !symbol) {
    return new NextResponse("Missing address or symbol", { status: 400 });
  }

  const cacheKey = `${address}:${symbol}`;
  if (iconCache.has(cacheKey)) {
    const cached = iconCache.get(cacheKey);
    if (cached) {
      return NextResponse.redirect(cached, 307);
    }
    return new NextResponse("Not Found", { status: 404 });
  }

  // 1. Check known verified mappings
  const staticUrl = resolveTokenIconUrl(symbol, address);
  if (staticUrl && !staticUrl.startsWith("/api/token-icon")) {
    iconCache.set(cacheKey, staticUrl);
    return NextResponse.redirect(staticUrl, 307);
  }

  // 2. Query GeckoTerminal on Robinhood Chain
  if (address) {
    try {
      const env = getEnv();
      const res = await fetch(
        `${env.INDEXER_BASE_URL}/networks/${encodeURIComponent(env.INDEXER_CHAIN_ID)}/tokens/${address}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );
      if (res.ok) {
        const json = (await res.json()) as {
          data?: { attributes?: { image_url?: string | null } };
        };
        const imageUrl = json.data?.attributes?.image_url;
        if (isRealTokenIcon(imageUrl)) {
          iconCache.set(cacheKey, imageUrl);
          return NextResponse.redirect(imageUrl, 307);
        }
      }
    } catch {}

    // 3. Query Blockscout
    try {
      const env = getEnv();
      const res = await fetch(
        `${env.BLOCKSCOUT_API_URL}/tokens/${address}`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );
      if (res.ok) {
        const json = (await res.json()) as { icon_url?: string | null };
        if (isRealTokenIcon(json.icon_url)) {
          iconCache.set(cacheKey, json.icon_url);
          return NextResponse.redirect(json.icon_url, 307);
        }
      }
    } catch {}
  }

  iconCache.set(cacheKey, null);
  return new NextResponse("Icon not found", {
    status: 404,
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
