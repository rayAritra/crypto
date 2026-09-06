"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { notify } from "./ToastViewport";

export function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center p-1 rounded hover:bg-surface-container-highest text-outline hover:text-primary transition-colors cursor-pointer"
      aria-label="Copy contract address"
      title={done ? "Copied!" : "Copy address"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(value);
        setDone(true);
        notify("Contract copied to clipboard");
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? (
        <FiCheck className="text-[13px] text-primary-fixed" />
      ) : (
        <FiCopy className="text-[13px]" />
      )}
    </button>
  );
}
