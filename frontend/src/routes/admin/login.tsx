import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
type FormValues = z.infer<typeof schema>;

type Search = { redirect?: string };

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Login — Maison Noir" },
      { name: "description", content: "Sign in to access the admin panel." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      navigate({ to: redirect ?? "/admin" });
    }
  }, [user, authLoading, navigate, redirect]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    const { error, user: next } = await signInWithPassword(data);
    setSubmitting(false);
    if (error || !next) {
      toast.error(error ?? "Sign in failed");
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: redirect ?? "/admin" });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white font-display font-bold">
                M
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                Maison<span className="text-black/50">Noir</span>
              </span>
            </Link>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-black/15 bg-white text-black hover:bg-black/[0.03]"
            >
              <Link to="/">Back to site</Link>
            </Button>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.45)]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
                  Admin access
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">Sign in</h1>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  Manage rooms, inventory and bookings. This area is restricted to administrators.
                </p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </label>
                <input
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="admin@maisonnoir.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60">
                  <Lock className="h-3.5 w-3.5" />
                  Password
                </label>
                <input
                  type="password"
                  className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 h-12 w-full rounded-xl bg-black text-white hover:bg-black/90"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>

              <p className="text-center text-xs text-black/55">
                Need help?{" "}
                <a
                  className="font-semibold text-black hover:underline"
                  href="mailto:support@maisonnoir.com"
                >
                  Contact support
                </a>
              </p>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-black/50">
            © {new Date().getFullYear()} Maison Noir
          </p>
        </div>
      </div>
    </div>
  );
}
