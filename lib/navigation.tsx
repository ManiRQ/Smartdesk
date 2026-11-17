import type { ComponentType } from "react";
import {
  IconDashboard,
  IconInventory,
  IconProducts,
  IconReports,
  IconSettings,
  IconSuppliers,
  type IconProps,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/", Icon: IconDashboard },
  { label: "Products", href: "/products", Icon: IconProducts },
  { label: "Inventory", href: "/inventory", Icon: IconInventory },
  { label: "Suppliers", href: "/suppliers", Icon: IconSuppliers },
  { label: "Reports", href: "/reports", Icon: IconReports },
  { label: "Settings", href: "/settings", Icon: IconSettings },
];
