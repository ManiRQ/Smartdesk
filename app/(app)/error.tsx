"use client";

import { useEffect } from "react";
import { Card } from "@/components/card";
import { FOCUS_RING } from "@/lib/styles";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page could not be displayed. Try again, and contact support if the
        problem continues.
      </p>
      <button
        type="button"
        onClick={reset}
        className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-150 hover:opacity-90 active:scale-[0.98] ${FOCUS_RING}`}
      >
        Try again
      </button>
    </Card>
  );
}
