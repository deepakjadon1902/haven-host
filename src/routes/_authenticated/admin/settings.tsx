import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { HotelSettings } from "@/types/room";
import { getHotelSettings } from "@/lib/rooms.functions";
import { adminUpdateSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings — Admin Panel" }],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  const [settings, setSettings] = useState<HotelSettings | null>(null);
  const [heroImage, setHeroImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getHotelSettings();
        if (!s) throw new Error("Missing hotel settings row");
        setSettings(s);
        setHeroImage(s.heroImage ?? "");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof HotelSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await adminUpdateSettings({
        name: settings.name.trim(),
        tagline: settings.tagline.trim(),
        city: settings.city.trim(),
        country: settings.country.trim(),
        address: settings.address.trim(),
        description: settings.description.trim(),
        hero_image: heroImage.trim(),
        contact_email: settings.contactEmail.trim(),
        contact_phone: settings.contactPhone.trim(),
      });
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
        <p className="text-gray-700">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-gray-700">
        <p>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-8 text-4xl font-bold text-black">Settings</h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-lg border-2 border-black bg-white p-6">
          <h2 className="mb-6 text-2xl font-bold text-black">Hotel Information</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Hotel Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded border-2 border-black px-3 py-2 text-black"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="w-full rounded border-2 border-black px-3 py-2 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-black">City</label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full rounded border-2 border-black px-3 py-2 text-black"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-black">Country</label>
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full rounded border-2 border-black px-3 py-2 text-black"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-black">Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full rounded border-2 border-black px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-black">Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded border-2 border-black px-3 py-2 text-black"
                rows={4}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-black">Hero Image URL</label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full rounded border-2 border-black px-3 py-2 text-black"
                placeholder="https://..."
              />
              {heroImage.trim() ? (
                <div className="mt-3 overflow-hidden rounded border border-black/10">
                  <img src={heroImage.trim()} alt="Hero preview" className="h-40 w-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 rounded-lg border-2 border-black bg-white p-6"
        >
          <h2 className="mb-6 text-2xl font-bold text-black">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-black">Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full rounded border-2 border-black px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-black">Phone</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                className="w-full rounded border-2 border-black px-3 py-2 text-black"
              />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Button onClick={handleSave} disabled={isSaving} className="bg-black px-8 py-3 font-bold text-white hover:bg-gray-800">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

