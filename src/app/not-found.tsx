import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center"
    >
      <Logo className="text-2xl" />
      <p className="num mt-10 text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        This page did not settle
      </h1>
      <p className="mt-3 max-w-sm text-muted">
        The address may have a typo, or the page has moved. Nothing was charged.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/pay" variant="secondary">
          Try the demo checkout
        </ButtonLink>
      </div>
    </main>
  );
}
