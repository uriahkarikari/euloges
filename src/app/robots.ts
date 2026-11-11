import type { MetadataRoute } from "next";

const SITE_URL = "https://www.euloges.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/home",
        "/memorials",
        "/create-brochure",
        "/analytics",
        "/login",
        "/signup",
        "/forgot-password",
        "/update-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
