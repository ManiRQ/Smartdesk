import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/components/icons";

type EmptyStateProps = {
  Icon: ComponentType<IconProps>;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
