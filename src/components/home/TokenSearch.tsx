"use client";

import { Button } from "@/components/shared/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { getAddress, isAddress } from "viem";

export function TokenSearch() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;

    if (isAddress(query)) {
      router.push(`/token/${getAddress(query)}`);
      return;
    }

    // Try finding token by symbol/name via search API
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        router.push(`/token/${data.data[0].token.address}`);
        return;
      }
      setError(
        "No indexed token matches this query. Enter a valid 0x... contract address.",
      );
    } catch {
      setError("Enter a valid EVM contract address (0x...).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-space-xl pt-space-md border-t border-outline-variant/60">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch gap-2"
      >
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <FiSearch className="text-[15px]" />
          </div>
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-data-mono-md font-data-mono-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
            placeholder="Search token or contract address (0x...)"
            type="text"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
          icon={<FiArrowRight className="text-[14px]" />}
          iconPosition="right"
        >
          {loading ? "Searching..." : "Analyze"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-error text-body-sm mt-1.5 font-medium">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between mt-2 text-data-mono-sm font-data-mono-sm text-outline">
        <span>Live indexed data</span>
        <span className="hidden sm:inline">Robinhood Chain Mainnet</span>
      </div>
    </div>
  );
}
