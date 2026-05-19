import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { AuthCard, authInputCls } from "@/components/site/AuthCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  fullName: z.string().trim().min(2, "Required").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — Maison Noir" },
      { name: "description", content: "Join Maison Noir to unlock member rates and itineraries." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/account" });
  }, [user, authLoading, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: { full_name: data.fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your inbox to verify, then sign in.");
    navigate({ to: "/login" });
  };

  const onGoogle = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <AuthCard
      eyebrow="Membership"
      title="Create your account"
      subtitle="It takes less than a minute to start curating your stays."
      footer={
        <span>
          Already a member?{" "}
          <Link to="/login" className="text-gold font-semibold hover:underline">
            Sign in
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
        Continue with Google
      </Button>

      <div className="relative my-6 text-center text-xs uppercase tracking-widest text-white/40">
        <span className="bg-background px-3 relative z-10">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldRow label="Full name" icon={<User className="h-3.5 w-3.5 text-gold" />} error={form.formState.errors.fullName?.message}>
          <input className={authInputCls} placeholder="Aria Sharma" {...form.register("fullName")} />
        </FieldRow>
        <FieldRow label="Email" icon={<Mail className="h-3.5 w-3.5 text-gold" />} error={form.formState.errors.email?.message}>
          <input className={authInputCls} placeholder="you@email.com" {...form.register("email")} />
        </FieldRow>
        <FieldRow label="Password" icon={<Lock className="h-3.5 w-3.5 text-gold" />} error={form.formState.errors.password?.message}>
          <input type="password" className={authInputCls} placeholder="At least 6 characters" {...form.register("password")} />
        </FieldRow>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold mt-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-[11px] text-white/45 text-center">
          By signing up you agree to our{" "}
          <Link to="/terms" className="underline">Terms</Link> &{" "}
          <Link to="/privacy" className="underline">Privacy policy</Link>.
        </p>
      </form>
    </AuthCard>
  );
}

function FieldRow({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
        {icon} {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}