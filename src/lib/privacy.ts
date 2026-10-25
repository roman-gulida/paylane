/**
 * Every visitor shares one dashboard, so what a visitor types must not show up
 * in full for everyone else. These run on the server before anything is saved.
 */

/** "ana@example.com" -> "a**@example.com". Never returns the whole local part */
export function maskEmail(email: string): string {
  const value = email.trim();
  const at = value.lastIndexOf("@");
  if (at < 1) return "***";
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const stars = "*".repeat(Math.min(Math.max(local.length - 1, 2), 5));
  return `${local[0]}${stars}@${domain}`;
}
