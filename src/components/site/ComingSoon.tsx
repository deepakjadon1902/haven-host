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
        <p className="text-white/65 leading-relaxed">
          This section is on the way. Meanwhile, browse our hotels or get in touch — we reply within
          the hour.
        </p>
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Button asChild className="rounded-full font-semibold">
            <Link to="/hotels">Browse hotels</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-white/20">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
