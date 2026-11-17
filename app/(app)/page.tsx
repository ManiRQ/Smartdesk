import type { Metadata } from "next";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { IconInventory, IconProducts } from "@/components/icons";
import { IconAlert, IconInbox, IconValue } from "@/components/status-icons";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

export const metadata: Metadata = {
  title: "Dashboard",
};

const SUMMARY_STATS = [
  { label: "Total Products", value: "0", Icon: IconProducts },
  { label: "Total Stock Quantity", value: "0", Icon: IconInventory },
  { label: "Low Stock Products", value: "0", Icon: IconAlert },
  { label: "Total Inventory Value", value: "$0.00", Icon: IconValue },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your products, stock levels and inventory value."
      />

      <section
        aria-label="Summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {SUMMARY_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            Icon={stat.Icon}
          />
        ))}
      </section>

      <section aria-labelledby="recent-activity-heading">
        <Card>
          <div className="border-b border-border px-5 py-4">
            <h2
              id="recent-activity-heading"
              className="text-base font-semibold text-foreground"
            >
              Recent Inventory Activity
            </h2>
          </div>
          <EmptyState
            Icon={IconInbox}
            title="No inventory activity yet"
            description="Stock movements will appear here once you start recording them."
          />
        </Card>
      </section>
    </div>
  );
}
