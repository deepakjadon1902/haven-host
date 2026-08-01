import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/site/ContentPage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Maison Noir" }] }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  const quotes = [
    {
      name: "Aarav",
      city: "Delhi",
      quote:
        "Everything felt calm — booking was clean, check-in was smooth, and the room was exactly as shown.",
    },
    {
      name: "Meera",
      city: "Mumbai",
      quote:
        "Quiet details everywhere. The lighting, linen, and the pace of service made it feel like a reset weekend.",
    },
    {
      name: "Rohan",
      city: "Jaipur",
      quote:
        "No surprises at checkout. Transparent totals and real availability — that’s rare and appreciated.",
    },
  ];

  return (
    <ContentPage
      title="Testimonials"
      description="A few words from guests who like their stays quiet, clean, and honest."
      sections={[
        {
          title: "Consistency",
          body: "The experience is designed to feel the same every time: clear booking, calm room, warm support.",
        },
        {
          title: "Detail-first",
          body: "Most feedback is about the small things: light, scent, linen, and silence.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {quotes.map((q) => (
          <figure key={q.name} className="rounded-3xl border border-black/10 bg-white p-7">
            <blockquote className="text-sm leading-relaxed text-gray-700">“{q.quote}”</blockquote>
            <figcaption className="mt-5 text-xs font-semibold uppercase tracking-wider text-black/60">
              {q.name} · {q.city}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-black">Ready to book?</p>
            <p className="mt-1 text-xs text-black/60">
              Browse rooms, pick dates, and confirm only what’s available.
            </p>
          </div>
          <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
            <Link to="/rooms">Browse rooms</Link>
          </Button>
        </div>
      </div>
    </ContentPage>
  );
}
