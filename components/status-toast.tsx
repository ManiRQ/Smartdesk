"use client";

import { useEffect } from "react";

const AUTO_DISMISS_MS = 4000;

type StatusToastProps = {
  message: string;
  onDismiss: () => void;
};

export function StatusToast({ message, onDismiss }: StatusToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-border border-l-4 border-l-primary bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg"
    >
      {message}
    </div>
  );
}
