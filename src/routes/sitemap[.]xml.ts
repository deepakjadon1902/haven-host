import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabaseAdmin.from("rooms").select("slug").eq("active", true);
        const staticPaths = [
          "/", "/rooms", "/offers", "/about", "/contact", "/gallery",
          "/blogs", "/faq", "/testimonials", "/terms", "/privacy", "/refund",
        ];
        const urls = [
          ...staticPaths.map((p) => `  <url><loc>${p}</loc></url>`),
          ...(data ?? []).map((r) => `  <url><loc>/rooms/${r.slug}</loc></url>`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
