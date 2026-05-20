import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { authInputCls } from "@/components/site/AuthCard";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My profile — Maison Noir" }] }),
  component: AccountPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  avatar_url: z.string().trim().url().max(500).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", phone: "", avatar_url: "" },
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Check if user is admin
      const { data: adminData } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!adminData);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      form.reset({
        full_name: data?.full_name ?? user.user_metadata?.full_name ?? "",
        phone: data?.phone ?? "",
        avatar_url: data?.avatar_url ?? "",
      });
      setLoading(false);
    })();
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: values.full_name,
      phone: values.phone || null,
      avatar_url: values.avatar_url || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated.");
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">Members</p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold">Your profile</h1>
      <p className="mt-2 text-white/65 max-w-xl">
        Keep your details current — we'll use them to personalize check-in and pre-arrival concierge.
      </p>

      {/* Admin Access Button */}
      {isAdmin && (
        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/40">
          <Shield className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-700">You have admin access</p>
            <p className="text-xs text-yellow-600">Manage rooms, bookings, and inventory</p>
          </div>
          <Button asChild className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
            <Link to="/admin">Go to Admin Panel</Link>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-8 max-w-xl rounded-3xl border border-white/10 bg-card p-6 lg:p-8 space-y-5"
        >
          <Field label="Email">
            <input className={authInputCls + " opacity-60"} value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Full name" error={form.formState.errors.full_name?.message}>
            <input className={authInputCls} {...form.register("full_name")} />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <input className={authInputCls} placeholder="+91 98765 43210" {...form.register("phone")} />
          </Field>
          <Field label="Avatar URL" error={form.formState.errors.avatar_url?.message}>
            <input className={authInputCls} placeholder="https://…" {...form.register("avatar_url")} />
          </Field>
          <Button type="submit" disabled={saving} className="rounded-full font-semibold h-11 px-6">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}