import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Maison Noir" }] }),
  component: GalleryPage,
});

function GalleryPage() {
  const shots = [
    {
      alt: "Sunlit room with soft linen",
      src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1800&q=80",
    },
    {
      alt: "Minimal luxury hotel lobby",
      src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1800&q=80",
    },
    {
      alt: "Warm light and calm interiors",
      src: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1800&q=80",
    },
    {
      alt: "Pool and quiet outdoor space",
      src: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1800&q=80",
    },
    {
      alt: "Breakfast table with clean details",
      src: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1800&q=80",
    },
    {
      alt: "Evening corridor ambience",
      src: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=1800&q=80",
    },
  ];

  return (
    <ContentPage
      title="Gallery"
      description="A quick look at the mood: light, materials, and spaces designed for calm."
      sections={[
        {
          title: "Real atmosphere",
          body: "We keep the gallery honest: what you see is what you book.",
        },
        {
          title: "Details matter",
          body: "Lighting, linen, scent, and silence — the small things that make comfort feel complete.",
        },
      ]}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shots.map((s) => (
          <figure
            key={s.src}
            className="overflow-hidden rounded-3xl border border-black/10 bg-white"
          >
            <img src={s.src} alt={s.alt} className="h-64 w-full object-cover" loading="lazy" />
            <figcaption className="p-4 text-xs text-black/60">{s.alt}</figcaption>
          </figure>
        ))}
      </div>
    </ContentPage>
  );
}
