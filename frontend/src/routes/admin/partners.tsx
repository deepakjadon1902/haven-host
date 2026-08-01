import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Ban, Copy, ImagePlus, Plus, ShieldCheck, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/types/room";
import {
  adminCreatePartnerWithHotel,
  adminListPartners,
  adminSetPartnerBlocked,
} from "@/lib/partner.functions";
import { storeImageFiles } from "@/lib/image-storage";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({
    meta: [{ title: "Partners - Admin Panel" }],
  }),
  component: AdminPartners,
});

function AdminPartners() {
  const [partners, setPartners] = useState(() => adminListPartners());
  const [hotelName, setHotelName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("partner123");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("signature");
  const [hotelImages, setHotelImages] = useState<string[]>([]);
  const [imageBusy, setImageBusy] = useState(false);

  const createPartner = () => {
    if (!hotelName.trim() || !city.trim() || !ownerName.trim() || !email.trim() || !password) {
      toast.error("Fill hotel, owner, email and password");
      return;
    }
    adminCreatePartnerWithHotel({
      hotelName,
      city,
      country,
      ownerName,
      email,
      password,
      subscriptionTier,
      image:
        hotelImages[0] ??
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
      images: hotelImages,
    });
    setPartners(adminListPartners());
    setHotelName("");
    setCity("");
    setOwnerName("");
    setEmail("");
    setPassword("partner123");
    setHotelImages([]);
    toast.success("Partner hotel and credentials created");
  };

  const uploadHotelImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageBusy(true);
    try {
      const stored = await storeImageFiles(files, 8);
      setHotelImages((prev) => [...prev, ...stored.urls].slice(0, 8));
      toast.success(
        `${stored.count} hotel image${stored.count !== 1 ? "s" : ""} ${
          stored.storedRemotely ? "uploaded to ImageKit" : "optimized locally"
        }`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to optimize image");
    } finally {
      setImageBusy(false);
    }
  };

  const togglePartner = (partnerId: string, blocked: boolean) => {
    const partner = adminSetPartnerBlocked({ partnerId, blocked });
    setPartners(adminListPartners());
    toast.success(
      blocked
        ? `${partner.hotelName} blocked. Login and public listings are disabled.`
        : `${partner.hotelName} unblocked. Login and public listings are restored.`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/50">
            Partner access
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Partner hotels
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/60">
            Create a subscribed hotel partner, issue separate credentials, and let that partner
            manage only their own listing, room types and inventory.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full border-black/15 bg-white">
          <Link to="/partner/login">Open partner login</Link>
        </Button>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">
            <Plus className="h-5 w-5" />
          </span>
          <h2 className="font-display text-2xl font-semibold">Create partner credentials</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Hotel name" value={hotelName} onChange={setHotelName} />
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Country" value={country} onChange={setCountry} />
          <Field label="Owner / partner" value={ownerName} onChange={setOwnerName} />
          <Field label="Partner email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={password} onChange={setPassword} />
          <label>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
              Subscription
            </span>
            <select
              value={subscriptionTier}
              onChange={(event) => setSubscriptionTier(event.target.value as SubscriptionTier)}
              className="h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm font-medium text-black"
            >
              <option value="starter">Starter</option>
              <option value="signature">Signature</option>
              <option value="black">Black</option>
            </select>
          </label>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[280px_1fr]">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#fafafa]">
            {hotelImages[0] ? (
              <img src={hotelImages[0]} alt="Hotel preview" className="h-44 w-full object-cover" />
            ) : (
              <div className="grid h-44 place-items-center text-sm text-black/45">No image</div>
            )}
          </div>
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-[#fafafa] p-6 text-center transition hover:border-black/40">
            <ImagePlus className="h-8 w-8 text-gold" />
            <span className="mt-3 text-sm font-semibold text-black">
              {imageBusy ? "Optimizing image..." : "Browse hotel image from device"}
            </span>
            <span className="mt-1 text-xs text-black/55">
              JPG, PNG or WebP. We resize and compress before storing.
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={imageBusy}
              multiple
              onChange={(event) => uploadHotelImages(event.target.files)}
            />
          </label>
        </div>
        {hotelImages.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hotelImages.map((image, index) => (
              <div
                key={`${image.slice(0, 32)}-${index}`}
                className="relative overflow-hidden rounded-xl border border-black/10 bg-white"
              >
                <img src={image} alt={`Hotel ${index + 1}`} className="h-28 w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                  {index === 0 ? "Cover" : `Image ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setHotelImages((prev) => prev.filter((item) => item !== image))}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-black"
                  aria-label="Remove hotel image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <Button onClick={createPartner} className="mt-5 rounded-full">
          Create partner
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {partners.map((partner, index) => (
          <motion.article
            key={partner.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-3xl border border-black/10 bg-white p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <ShieldCheck className="h-4 w-4" />
                  {partner.subscriptionTier} subscription
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{partner.hotelName}</h3>
                <p className="mt-1 text-sm text-black/60">{partner.ownerName}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  partner.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {partner.active ? "Active" : "Blocked"}
              </span>
            </div>
            <p className="mt-4 rounded-2xl border border-black/10 bg-[#fafafa] p-4 text-sm leading-relaxed text-black/65">
              {partner.active
                ? "This partner can access their panel and their hotel listings are visible in the main application."
                : "This partner is blocked. They cannot access their panel and their hotel listings are hidden from the main application."}
            </p>
            <div className="mt-5 rounded-2xl border border-black/10 bg-[#fafafa] p-4 text-sm">
              <p>
                <span className="font-semibold">Login:</span> {partner.email}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Password:</span> {partner.password}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-full border-black/15"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `Partner login: ${partner.email}\nPassword: ${partner.password}`,
                );
                toast.success("Credentials copied");
              }}
            >
              <Copy className="h-4 w-4" />
              Copy credentials
            </Button>
            <Button
              type="button"
              variant={partner.active ? "destructive" : "default"}
              className="ml-3 mt-4 rounded-full"
              onClick={() => togglePartner(partner.id, partner.active)}
            >
              {partner.active ? <Ban className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {partner.active ? "Block partner" : "Unblock partner"}
            </Button>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm font-medium text-black"
      />
    </label>
  );
}
