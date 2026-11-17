import type { ComponentType } from "react";
import { Card } from "@/components/card";
import type { IconProps } from "@/components/icons";

type StatCardProps = {
  label: string;
  value: string;
  Icon: ComponentType<IconProps>;
};

export function StatCard({ label, value, Icon }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </Card>
  );
}
