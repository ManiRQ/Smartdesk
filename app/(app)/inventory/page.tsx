import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <ComingSoon
      title="Inventory"
      description="Track stock levels and record every stock movement across your products."
    />
  );
}
