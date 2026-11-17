import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Configure your business profile and inventory preferences."
    />
  );
}
