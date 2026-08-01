import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";

export function ContentPage({
  eyebrow = "Haven Host",
  title,
  description,
  children,
  sections,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  sections?: { title: string; body: string }[];
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {children ? <div className="mb-14">{children}</div> : null}
        {sections?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((s) => (
              <section key={s.title} className="premium-card rounded-lg p-7">
                <h2 className="font-display text-2xl font-semibold leading-tight text-black">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{s.body}</p>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </SiteLayout>
  );
}
