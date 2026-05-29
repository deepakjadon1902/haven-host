import { Link } from "@tanstack/react-router";
import { SiteLayout } from "./SiteLayout";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="leading-relaxed text-gray-700">
          This section is on the way. Meanwhile, browse our rooms or get in touch — we reply within
          the hour.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full font-semibold">
            <Link to="/rooms">Browse rooms</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-black/15 text-black hover:bg-gray-50"
          >
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
