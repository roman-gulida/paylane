"use client";

import { useEffect } from "react";
import { Logo } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <Logo className="text-2xl" />
      <h1 className="mt-10 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-sm text-muted">
        An unexpected error stopped this page. Nothing was charged. You can try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
