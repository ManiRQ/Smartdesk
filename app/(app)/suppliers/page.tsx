import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Suppliers",
};

export default function SuppliersPage() {
  return (
    <ComingSoon
      title="Suppliers"
      description="Keep a directory of the suppliers you buy from and their contact details."
    />
  );
}
