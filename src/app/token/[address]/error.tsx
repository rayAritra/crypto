"use client";

import { Button } from "@/components/shared/Button";
import { FiAlertTriangle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 text-center flex flex-col items-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-error-container/20 border border-error/40 flex items-center justify-center mb-4 text-error">
          <FiAlertTriangle className="text-2xl" />
        </div>
        <h1 className="text-xl font-headline font-bold text-on-surface">
          Unable to Load Token Analytics
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          An error occurred while fetching contract state, DEX liquidity pools,
          or trade events from Robinhood Chain indexers.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={reset}
            icon={<FiRefreshCw className="text-sm" />}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            size="md"
            href="/discover"
            icon={<FiArrowLeft className="text-sm" />}
          >
            Back to Discover
          </Button>
        </div>
      </div>
    </main>
  );
}
