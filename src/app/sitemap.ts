import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** The dashboard and styleguide are left out on purpose - they are demo screens, not landing pages */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/pay`, priority: 0.8 },
  ];
}
