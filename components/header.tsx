import { IconInventory, IconMenu, IconUser } from "@/components/icons";
import { FOCUS_RING } from "@/lib/styles";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={`inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-muted lg:hidden ${FOCUS_RING}`}
        >
          <IconMenu className="size-5" />
        </button>
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconInventory className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            StockPilot
          </span>
        </span>
      </div>
      <div
        role="img"
        aria-label="User profile (placeholder)"
        className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <IconUser className="size-5" />
      </div>
    </header>
  );
}
