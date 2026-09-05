import { Info } from "lucide-react";
export function MetricTooltip({ text }: { text: string }) { return <span className="tooltip" tabIndex={0} aria-label={text}><Info size={13}/><span role="tooltip">{text}</span></span>; }
