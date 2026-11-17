"use client";

import { useEffect, useRef } from "react";
import { IconClose } from "@/components/icons";
import { Sidebar } from "@/components/sidebar";
import { FOCUS_RING } from "@/lib/styles";

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  if (!isOpen) {
    return null;
  }
  return <DrawerPanel onClose={onClose} />;
}

function DrawerPanel({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close navigation menu"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-foreground/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-lg"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold text-foreground">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className={`inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-muted ${FOCUS_RING}`}
          >
            <IconClose className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <Sidebar onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
