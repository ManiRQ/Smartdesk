"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/navigation";
import { FOCUS_RING } from "@/lib/styles";

type NavLinkProps = {
  item: NavItem;
  onNavigate?: () => void;
};

export function NavLink({ item, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const { Icon } = item;

  const stateClasses = isActive
    ? "bg-primary/10 text-primary"
    : "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${stateClasses} ${FOCUS_RING}`}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary"
        />
      )}
      <Icon className="size-5 shrink-0" />
      {item.label}
    </Link>
  );
}
