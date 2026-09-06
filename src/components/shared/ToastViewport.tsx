"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

export type ToastDetail = { message: string; kind?: "success" | "info" };

export function notify(message: string, kind: ToastDetail["kind"] = "success") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ToastDetail>("hoodlens:toast", {
        detail: { message, kind },
      }),
    );
  }
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<Array<ToastDetail & { id: number }>>([]);

  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      const id = Date.now();
      setToasts((current) => [...current.slice(-2), { ...detail, id }]);
      setTimeout(
        () => setToasts((current) => current.filter((item) => item.id !== id)),
        2600,
      );
    };
    window.addEventListener("hoodlens:toast", receive);
    return () => window.removeEventListener("hoodlens:toast", receive);
  }, []);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface-container-highest/95 border border-outline-variant shadow-2xl backdrop-blur-md text-on-surface text-body-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="status"
          key={toast.id}
        >
          {toast.kind === "info" ? (
            <FiInfo className="text-secondary-fixed text-base shrink-0" />
          ) : (
            <FiCheckCircle className="text-primary-fixed text-base shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="ml-2 text-outline hover:text-on-surface p-0.5 rounded cursor-pointer"
            onClick={() =>
              setToasts((current) =>
                current.filter((item) => item.id !== toast.id),
              )
            }
            aria-label="Dismiss"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
