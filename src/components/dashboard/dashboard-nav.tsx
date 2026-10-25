"use client";

import { ArrowLeft, ArrowLeftRight, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DEMO_MERCHANT } from "@/lib/orders";
import { ResetDemo, WalletCard } from "./demo-controls";

const LINKS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    Icon: ArrowLeftRight,
  },
] as const;

function NavLinks({ layout }: { layout: "sidebar" | "bar" }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Dashboard"
      className={cn(layout === "sidebar" ? "space-y-1" : "flex gap-1")}
    >
      {LINKS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
              layout === "sidebar" ? "h-10 px-3" : "h-9 px-3",
              active
                ? "bg-accent/10 text-accent"
                : "text-muted hover:bg-raised hover:text-fg",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop - fixed-width column that stays in view while the page scrolls */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto bg-surface px-4 py-6 lg:flex">
      <Link href="/" aria-label="Paylane home" className="px-3">
        <Logo />
      </Link>

      <div className="mt-8 flex items-center gap-3 rounded-xl bg-raised/60 p-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-raised text-sm font-semibold text-accent"
        >
          B
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{DEMO_MERCHANT.name}</p>
          <Badge className="mt-1 px-2 py-0.5 text-[11px]">Demo merchant</Badge>
        </div>
      </div>

      <div className="mt-6">
        <NavLinks layout="sidebar" />
      </div>

      <div className="mt-auto space-y-2 pt-6">
        <WalletCard className="mb-3" />
        <ButtonLink href="/pay" size="sm" className="w-full">
          <Plus aria-hidden className="size-4" />
          Test payment
        </ButtonLink>
        <Link
          href="/"
          className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to site
        </Link>
        <ResetDemo className="w-full" />
      </div>
    </aside>
  );
}

/** Mobile and tablet - logo and the two links in one compact bar */
export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-surface px-4 py-3 sm:px-8 lg:hidden">
      <Link href="/" aria-label="Paylane home">
        <Logo className="text-lg" />
      </Link>
      <ButtonLink href="/pay" size="sm">
        <Plus aria-hidden className="size-4" />
        Test payment
      </ButtonLink>
      <div className="w-full">
        <NavLinks layout="bar" />
      </div>
    </header>
  );
}
