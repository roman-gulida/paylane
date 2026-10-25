/**
 * The public address of the site, used for share images, the sitemap and
 * canonical links. Set NEXT_PUBLIC_SITE_URL to your own domain; on Vercel the
 * production address is picked up automatically.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Paylane";
export const SITE_TAGLINE = "Accept cards. Settle in USDC.";
export const SITE_DESCRIPTION =
  "Paylane is a demo payment gateway: accept Visa, Mastercard, Apple Pay and Google Pay, and settle in USDC. Portfolio project, no real payments.";
