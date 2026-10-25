/**
 * Amount limits and text-to-cents parsing, shared by the landing calculator,
 * the checkout and the API schema, so they can never disagree
 */

/** $5 minimum: with a $1 fixed fee, tiny payments would leave almost nothing to settle */
export const MIN_AMOUNT_CENTS = 500;
export const MAX_AMOUNT_CENTS = 10_000_000;

/** Keeps digits and at most one dot, two decimals, six integer digits */
export function sanitizeAmount(input: string): string {
  const cleaned = input.replace(/[^\d.]/g, "");
  const [int = "", ...rest] = cleaned.split(".");
  const intPart = int.slice(0, 6);
  if (rest.length === 0) return intPart;
  return `${intPart}.${rest.join("").slice(0, 2)}`;
}

/** "12.3" => 1230 cents. String maths, so no floating-point rounding surprises */
export function amountToCents(raw: string): number {
  const [int = "0", frac = ""] = raw.split(".");
  return Number(int || 0) * 100 + Number((frac + "00").slice(0, 2));
}
