export function TokenAvatar({ address, symbol, size = 40 }: { address: string; symbol: string; size?: number }) {
  const seed = Number.parseInt(address.slice(2, 10), 16) || 1, hue = seed % 360, hue2 = (hue + 58 + seed % 70) % 360;
  return <span className="token-avatar" aria-hidden="true" style={{ width: size, height: size, background: `linear-gradient(145deg,hsl(${hue} 65% 48%),hsl(${hue2} 72% 30%))` }}>{symbol.slice(0, 2).toUpperCase()}</span>;
}
