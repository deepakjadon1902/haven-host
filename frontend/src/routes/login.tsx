import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canUseGoogleAuth, renderGoogleButton } from "@/lib/google-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in - Haven Host" },
      {
        name: "description",
        content: "Sign in to save bookings, track stays, and manage your profile.",
      },
    ],
  }),
  component: MainLoginPage,
});

function MainLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;
    if (!canUseGoogleAuth()) return;
    renderGoogleButton({
      container: el,
      variant: "signin",
      onSuccess: () => {
        toast.success("Signed in with Google.");
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
            Members
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[1.02]"
          >
            Sign in for quieter, faster bookings.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-lg text-sm leading-relaxed text-black/60"
          >
            Save traveler details, revisit receipts, and see every reservation in one place. If you
            do not have an account yet, you can create one in under a minute.
          </motion.p>
          <div className="mt-8 flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-lg border-black/15 bg-white text-black hover:bg-black/[0.03]"
            >
              <Link to="/">Back home</Link>
            </Button>
            <Button asChild className="rounded-lg bg-black text-white hover:bg-black/90">
              <Link to="/rooms">Browse rooms</Link>
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
              <span className="premium-icon grid h-10 w-10 place-items-center rounded-lg">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Haven<span className="gold-text">Host</span>
              </span>
            </Link>
          </div>

          <div className="premium-card rounded-lg p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
              Sign in
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-black/60">Continue with Google or email.</p>

            <div className="mt-6">
              {canUseGoogleAuth() ? (
                <div className="flex justify-center" ref={googleBtnRef} />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full rounded-lg border-black/15 bg-white text-black hover:bg-black/[0.03]"
                  onClick={() => {
                    toast.error(
                      "Google sign-in is not configured. Set VITE_API_BASE_URL and VITE_GOOGLE_CLIENT_ID.",
                    );
                  }}
                >
                  <GoogleIcon />
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
                  toast.success("Signed in (demo).");
                  navigate({ to: "/" });
                }, 450);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <Mail className="h-3.5 w-3.5" /> Email
                </label>
                <input
                  className="h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
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
                  className="h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-1 h-12 w-full rounded-lg bg-black text-white hover:bg-black/90"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-black/60">
                New here?{" "}
                <Link to="/signup" className="font-semibold text-black hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-black/50">
            © {new Date().getFullYear()} Haven Host
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
