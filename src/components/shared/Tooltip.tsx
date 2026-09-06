import { FiInfo } from "react-icons/fi";

export function MetricTooltip({ text }: { text: string }) {
  return (
    <span
      className="group relative inline-flex items-center text-outline hover:text-on-surface cursor-help"
      tabIndex={0}
      aria-label={text}
    >
      <FiInfo className="text-[13px]" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus:block w-48 rounded-lg bg-surface-container-highest p-2 text-xs text-on-surface shadow-xl border border-outline-variant z-50 font-normal leading-relaxed"
      >
        {text}
      </span>
    </span>
  );
}
