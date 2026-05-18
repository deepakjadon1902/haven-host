import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { hotels } from "@/data/hotels";

const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly" | "daily";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/hotels", changefreq: "daily", priority: "0.9" },
          { path: "/offers", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/gallery", changefreq: "monthly", priority: "0.5" },
          { path: "/blogs", changefreq: "weekly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.5" },
          { path: "/testimonials", changefreq: "monthly", priority: "0.5" },
          { path: "/terms", changefreq: "monthly", priority: "0.3" },
          { path: "/privacy", changefreq: "monthly", priority: "0.3" },
          { path: "/refund", changefreq: "monthly", priority: "0.3" },
        ];
        const hotelPaths: SitemapEntry[] = hotels.map((h) => ({
          path: `/hotels/${h.slug}`,
          changefreq: "weekly",
          priority: "0.8",
        }));
        const entries = [...staticPaths, ...hotelPaths];

        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
