import type { CardBrand } from "./format";

/** Pure card-form validation. Each function returns an error message, or undefined when valid */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function detectBrand(digits: string): CardBrand | null {
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^4/.test(digits)) return "visa";
  return null;
}

/** Luhn checksum: catches most mistyped card numbers */
export function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your email for the receipt.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return "Enter a valid email address.";
}

export function validateCardNumber(digits: string): string | undefined {
  if (!digits) return "Enter your card number.";
  if (digits.length < 13 || !passesLuhn(digits))
    return "Check the card number.";
}

/** `value` is the formatted input ("12 / 28"). `now` is injected so this stays pure */
export function validateExpiry(value: string, now: Date): string | undefined {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return "Enter the expiry as MM / YY.";
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return "Enter a valid month (01-12).";
  // A card works through the last day of its expiry month
  const expiresAt = Date.UTC(year, month, 1);
  if (expiresAt <= now.getTime()) return "This card has expired.";
  if (year > now.getUTCFullYear() + 20) return "Check the expiry year.";
}

export function cvcLength(brand: CardBrand | null): 3 | 4 {
  return brand === "amex" ? 4 : 3;
}

export function validateCvc(
  value: string,
  brand: CardBrand | null,
): string | undefined {
  const length = cvcLength(brand);
  if (value.length !== length)
    return `Enter the ${length}-digit security code.`;
}

/** "12 / 28" => "12/28", the shape the API expects */
export function expiryForApi(value: string): string {
  const d = digitsOnly(value);
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
