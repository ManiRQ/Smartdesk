import Link from "next/link";
import { Card } from "@/components/card";
import { FOCUS_RING } from "@/lib/styles";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-150 hover:opacity-90 ${FOCUS_RING}`}
        >
          Back to dashboard
        </Link>
      </Card>
    </main>
  );
}
