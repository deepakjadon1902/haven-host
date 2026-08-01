import { createFileRoute } from "@tanstack/react-router";
import { Building2, CreditCard, FileText, Save, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { partnerProfile, partnerSaveProfile } from "@/lib/partner.functions";

export const Route = createFileRoute("/partner/profile")({
  component: PartnerProfilePage,
});

function PartnerProfilePage() {
  const { partner, hotel } = partnerProfile();
  const [ownerName, setOwnerName] = useState(partner.ownerName);
  const [businessName, setBusinessName] = useState(partner.businessName ?? hotel.name);
  const [email, setEmail] = useState(partner.email);
  const [phone, setPhone] = useState(partner.phone ?? hotel.partnerContactPhone ?? "");
  const [upiId, setUpiId] = useState(partner.upiId ?? hotel.upiId ?? "");
  const [hotelName, setHotelName] = useState(hotel.name);
  const [tagline, setTagline] = useState(hotel.tagline);
  const [address, setAddress] = useState(hotel.address);
  const [description, setDescription] = useState(hotel.description);
  const [termsAndConditions, setTermsAndConditions] = useState(hotel.termsAndConditions ?? "");
  const [cancellationPolicy, setCancellationPolicy] = useState(hotel.cancellationPolicy ?? "");
  const [checkInInstructions, setCheckInInstructions] = useState(hotel.checkInInstructions ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSaving(true);
        try {
          partnerSaveProfile({
            ownerName,
            businessName,
            email,
            phone,
            upiId,
            hotelName,
            tagline,
            address,
            description,
            termsAndConditions,
            cancellationPolicy,
            checkInInstructions,
          });
          toast.success("Partner profile updated");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Partner profile
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Hotel and payout settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
            These details belong only to this partner account and this hotel listing.
          </p>
        </div>
        <Button type="submit" disabled={saving} className="rounded-lg">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <section className="premium-card rounded-lg p-6">
        <SectionTitle icon={UserRound} title="Owner profile" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput label="Owner name" value={ownerName} onChange={setOwnerName} />
          <TextInput label="Business name" value={businessName} onChange={setBusinessName} />
          <TextInput label="Email" type="email" value={email} onChange={setEmail} />
          <TextInput label="Phone" value={phone} onChange={setPhone} />
        </div>
      </section>

      <section className="premium-card rounded-lg p-6">
        <SectionTitle icon={Building2} title="Hotel listing" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput label="Hotel name" value={hotelName} onChange={setHotelName} />
          <TextInput label="Tagline" value={tagline} onChange={setTagline} />
          <div className="md:col-span-2">
            <TextInput label="Address" value={address} onChange={setAddress} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Description" value={description} onChange={setDescription} rows={5} />
          </div>
        </div>
      </section>

      <section className="premium-card rounded-lg p-6">
        <SectionTitle icon={CreditCard} title="Payment setup" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextInput label="UPI ID for this listing" value={upiId} onChange={setUpiId} />
          <div className="rounded-lg border border-black/10 bg-surface p-4 text-sm text-black/60">
            Payments for this partner listing can be mapped to this UPI ID separately from admin
            platform settings.
          </div>
        </div>
      </section>

      <section className="premium-card rounded-lg p-6">
        <SectionTitle icon={FileText} title="Terms and guest policies" />
        <div className="mt-5 grid gap-4">
          <TextArea
            label="Terms and conditions"
            value={termsAndConditions}
            onChange={setTermsAndConditions}
          />
          <TextArea
            label="Cancellation policy"
            value={cancellationPolicy}
            onChange={setCancellationPolicy}
          />
          <TextArea
            label="Check-in instructions"
            value={checkInInstructions}
            onChange={setCheckInInstructions}
          />
        </div>
      </section>
    </form>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="premium-icon h-10 w-10 rounded-lg">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
    </div>
  );
}

function TextInput({
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
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-sm font-medium outline-none transition focus:border-gold"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-black/55">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-medium leading-relaxed outline-none transition focus:border-gold"
      />
    </label>
  );
}
