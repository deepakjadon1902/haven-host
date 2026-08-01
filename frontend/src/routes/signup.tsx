import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canUseGoogleAuth, renderGoogleButton } from "@/lib/google-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Maison Noir" },
      {
        name: "description",
        content: "Create an account to save bookings and unlock member perks.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;
    if (!canUseGoogleAuth()) return;
    renderGoogleButton({
      container: el,
      variant: "signup",
      onSuccess: () => {
        toast.success("Signed up with Google.");
        navigate({ to: "/" });
      },
      onError: (err) => toast.error(err.message),
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50"
          >
            Maison Noir Membership
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.02]"
          >
            Create an account for member-only calm.
          </motion.h1>
          <motion.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-lg space-y-3 text-sm text-black/60"
          >
            <li>• Faster checkout with saved traveler details</li>
            <li>• Booking history and invoices in one place</li>
            <li>• Early access to seasonal offers and private rates</li>
          </motion.ul>
          <div className="mt-8 flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-black/15 bg-white text-black hover:bg-black/[0.03]"
            >
              <Link to="/">Back home</Link>
            </Button>
            <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
              <Link to="/offers">View offers</Link>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-7 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white font-display font-bold">
                M
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Maison<span className="text-black/50">Noir</span>
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
              Sign up
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-black/60">
              Continue with Google, or sign up with email.
            </p>

            <div className="mt-6">
              {canUseGoogleAuth() ? (
                <div className="flex justify-center" ref={googleBtnRef} />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-black/15 bg-white text-black hover:bg-black/[0.03]"
                  onClick={() => {
                    toast.error(
                      "Google sign-up is not configured. Set VITE_API_BASE_URL and VITE_GOOGLE_CLIENT_ID.",
                    );
                  }}
                >
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-black text-white text-[10px] font-bold">
                    G
                  </span>
                  Continue with Google
                </Button>
              )}
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <div className="text-xs font-semibold uppercase tracking-wider text-black/40">or</div>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  toast.success("Account created (demo).");
                  navigate({ to: "/" });
                }, 550);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <User className="h-3.5 w-3.5" /> Full name
                </label>
                <input
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  type="email"
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="you@domain.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <Lock className="h-3.5 w-3.5" /> Password
                </label>
                <input
                  type="password"
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <p className="mt-2 text-xs text-black/50">
                  By creating an account you agree to our{" "}
                  <Link to="/terms" className="font-semibold text-black hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="font-semibold text-black hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-1 h-12 w-full rounded-xl bg-black text-white hover:bg-black/90"
              >
                {loading ? "Creating…" : "Create account"}
              </Button>

              <p className="text-center text-sm text-black/60">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-black hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-black/50">
            © {new Date().getFullYear()} Maison Noir
          </p>
        </motion.div>
      </div>
    </div>
  );
}
