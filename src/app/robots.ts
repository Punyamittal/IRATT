import type { MetadataRoute } from "next";

const SITE_URL = "https://iratt.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register"],
        disallow: ["/admin", "/api/", "/register/success"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/register"],
        disallow: ["/admin", "/api/", "/register/success"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
