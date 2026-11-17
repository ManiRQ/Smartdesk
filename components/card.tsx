import type { ReactNode } from "react";

type CardProps = {
  className?: string;
  children?: ReactNode;
};

export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
