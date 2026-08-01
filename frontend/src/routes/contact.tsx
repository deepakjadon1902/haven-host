import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Maison Noir" }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      description="Questions, changes, special requests — send a message and we’ll reply quickly."
      sections={[
        {
          title: "Support",
          body: "For booking help, room questions, or date changes — include your booking reference if you have one.",
        },
        {
          title: "Special requests",
          body: "Celebrations, late check-in, dietary notes — tell us early and we’ll do our best.",
        },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-white p-7">
          <h2 className="font-display text-2xl font-semibold text-black">Send a message</h2>
          <p className="mt-2 text-sm text-black/60">
            We typically reply within the hour during daytime.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Message sent (demo).");
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/30"
                placeholder="Full name"
                required
              />
              <input
                type="email"
                className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/30"
                placeholder="Email"
                required
              />
            </div>
            <input
              className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/30"
              placeholder="Subject"
              required
            />
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-black outline-none focus:border-black/30"
              placeholder="Your message…"
              required
            />
            <Button
              type="submit"
              className="h-12 rounded-xl bg-black px-6 text-white hover:bg-black/90"
            >
              Send message
            </Button>
          </form>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-7">
          <h2 className="font-display text-2xl font-semibold text-black">Direct contact</h2>
          <p className="mt-2 text-sm text-black/60">
            Prefer email or phone? Use the details below.
          </p>

          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold text-black">support@maisonnoir.com</div>
                <div className="text-xs text-black/60">Email support</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold text-black">+91 00000 00000</div>
                <div className="text-xs text-black/60">Call (demo)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold text-black">Vrindavan</div>
                <div className="text-xs text-black/60">Property location</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentPage>
  );
}
