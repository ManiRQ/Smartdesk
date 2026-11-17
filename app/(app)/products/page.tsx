import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <ComingSoon
      title="Products"
      description="Create and manage the products you sell, including SKUs, categories and prices."
    />
  );
}
