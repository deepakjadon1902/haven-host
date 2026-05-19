import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { AuthCard, authInputCls } from "@/components/site/AuthCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
type FormValues = z.infer<typeof schema>;

type Search = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Maison Noir" },
      { name: "description", content: "Access your reservations and saved hotels." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: redirect ?? "/account" });
  }, [user, authLoading, navigate, redirect]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back.");
    navigate({ to: redirect ?? "/account" });
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <AuthCard
      eyebrow="Members"
      title="Welcome back"
      subtitle="Sign in to manage reservations, profile and saved stays."
      footer={
        <span>
          New to Maison Noir?{" "}
          <Link to="/signup" className="text-gold font-semibold hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <Button
        type="button"
        onClick={onGoogle}
        variant="outline"
        className="w-full h-12 rounded-xl border-white/15 hover:border-gold/60 font-semibold"
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="relative my-6 text-center text-xs uppercase tracking-widest text-white/40">
        <span className="bg-background px-3 relative z-10">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Mail className="h-3.5 w-3.5 text-gold" /> Email
          </label>
          <input className={authInputCls} placeholder="you@email.com" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-gold" /> Password
          </label>
          <input
            type="password"
            className={authInputCls}
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-semibold mt-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}