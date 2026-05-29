import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Maison Noir" }] }),
  component: JournalPage,
});

function JournalPage() {
  const posts = [
    {
      title: "A quieter way to travel",
      body: "How to choose rooms, dates, and rituals that make a stay feel like a reset.",
      tag: "Guides",
    },
    {
      title: "Design notes: calm, not cold",
      body: "The materials, light, and scent choices that create warmth without noise.",
      tag: "Story",
    },
    {
      title: "Packing list for a slow weekend",
      body: "The few essentials that keep your trip light and your mornings unhurried.",
      tag: "Checklist",
    },
  ];

  return (
    <ContentPage
      title="Journal"
      description="Short reads on slow travel, room etiquette, and the tiny details that change how a stay feels."
      sections={[
        {
          title: "Editorial, not ads",
          body: "Every entry is written to be useful: what to book, what to bring, and how to make the most of a calm hotel rhythm.",
        },
        {
          title: "Practical by default",
          body: "We share honest guidance on check-in timing, room types, and seasonal planning — without the noise.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {posts.map((p, i) => (
          <motion.article
            key={p.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-black/10 bg-white p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fafafa] px-3 py-1 text-xs font-semibold text-black/70">
                <PenLine className="h-3.5 w-3.5" /> {p.tag}
              </div>
              <Bookmark className="h-4 w-4 text-black/40" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-black">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{p.body}</p>
            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-full border-black/15 bg-white text-black hover:bg-black/[0.03]"
              >
                Read more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
              Want updates?
            </p>
            <p className="mt-2 text-sm text-gray-700">
              New entries arrive quietly — once in a while, not every day.
            </p>
          </div>
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/contact">Subscribe via email</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
