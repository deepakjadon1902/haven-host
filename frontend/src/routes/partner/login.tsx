import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { signInPartner } from "@/lib/partner-session";

export const Route = createFileRoute("/partner/login")({
  head: () => ({
    meta: [{ title: "Partner Login - Haven Host" }],
  }),
  component: PartnerLogin,
});

function PartnerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("partner@havenhost.com");
  const [password, setPassword] = useState("partner123");
  const [submitting, setSubmitting] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const { session, error } = signInPartner({ email, password });
    setSubmitting(false);
    if (!session) {
      toast.error(error ?? "Partner login failed");
      return;
    }
    toast.success(`Welcome, ${session.hotelName}`);
    navigate({ to: "/partner" });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-black font-display font-bold text-white">
                H
              </span>
              <span className="font-display text-lg font-semibold">Haven Host</span>
            </Link>
            <Button asChild variant="outline" className="rounded-full border-black/15 bg-white">
              <Link to="/">Back to site</Link>
            </Button>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
                  Partner access
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold">Sign in</h1>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  Use the credentials created by the admin for your hotel subscription.
                </p>
              </div>
            </div>

            <label className="mt-7 block">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                <Mail className="h-3.5 w-3.5" />
                Partner email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/30"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                <Lock className="h-3.5 w-3.5" />
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus:border-black/30"
              />
            </label>

            <Button disabled={submitting} className="mt-6 h-12 w-full rounded-xl">
              {submitting ? "Signing in..." : "Sign in to partner panel"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
