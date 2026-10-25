import type { PaymentMethod } from "./types";

/** Display helpers. All money inputs are integers (cents / micro-USDC) */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdcNumber = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatUSD(cents: number): string {
  return usd.format(cents / 100);
}

export function formatUSDCompact(cents: number): string {
  return compact.format(cents / 100);
}

/** "1,234.56". Rounds to cents for display; the stored value keeps 6 decimals */
export function formatUSDCNumber(micro: number): string {
  return usdcNumber.format(micro / 1_000_000);
}

/** "1,234.56 USDC" */
export function formatUSDC(micro: number): string {
  return `${formatUSDCNumber(micro)} USDC`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export type CardBrand = "visa" | "mastercard" | "amex";

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
};

export function brandLabel(brand: CardBrand): string {
  return BRAND_LABEL[brand];
}

/** "Visa •••• 4242" */
export function maskCard(brand: CardBrand, last4: string): string {
  return `${BRAND_LABEL[brand]} •••• ${last4}`;
}

/** Card payments show the masked card; wallets show the wallet and the card behind it */
export function describeMethod(
  method: PaymentMethod,
  brand: CardBrand,
  last4: string,
): string {
  if (method === "card") return maskCard(brand, last4);
  const wallet = method === "apple_pay" ? "Apple Pay" : "Google Pay";
  return `${wallet} · •••• ${last4}`;
}

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Fixed to UTC so server and client render identical text (no hydration mismatch) */
export function formatDateTime(iso: string): string {
  return `${dateTime.format(new Date(iso))} UTC`;
}

export function formatDate(iso: string): string {
  return dateOnly.format(new Date(iso));
}

const dayShort = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "2026-10-05" -> "5 Oct". Chart axes and the table view */
export function formatDayShort(day: string): string {
  return dayShort.format(new Date(`${day}T00:00:00Z`));
}

/** Card number input: groups digits in 4s ("4242424242424242" => "4242 4242 4242 4242") */
export function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Expiry input: "1228" => "12 / 28" */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
