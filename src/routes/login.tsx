import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { AuthCard, authInputCls } from "@/components/site/AuthCard";
import { Button } from "@/components/ui/button";
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
      { title: "Admin Sign in — Maison Noir" },
      { name: "description", content: "Sign in to access the admin panel." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: redirect ?? "/admin" });
  }, [user, authLoading, navigate, redirect]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const { error } = await signInWithPassword(data);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome, admin.");
    navigate({ to: redirect ?? "/admin" });
  };

  return (
    <AuthCard
      eyebrow="Admin"
      title="Admin sign in"
      subtitle="Use the admin credentials to manage rooms and inventory."
    >
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
        <div className="font-semibold text-white">Admin credentials</div>
        <div className="mt-1">Email: <span className="font-mono">deepakjadon1907@gmail.com</span></div>
        <div>Password: <span className="font-mono">deepakjadon1907@</span></div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Mail className="h-3.5 w-3.5 text-gold" /> Email
          </label>
          <input className={authInputCls} placeholder="admin@email.com" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
            <Lock className="h-3.5 w-3.5 text-gold" /> Password
          </label>
          <input type="password" className={authInputCls} placeholder="••••••••" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-semibold mt-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
