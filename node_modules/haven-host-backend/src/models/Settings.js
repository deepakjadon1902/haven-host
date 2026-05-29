import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Maison Noir" },
    tagline: { type: String, default: "Curated luxury hospitality" },
    city: { type: String, default: "Vrindavan" },
    country: { type: String, default: "India" },
    address: { type: String, default: "" },
    description: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

settingsSchema.pre("save", function onSave(next) {
  this.updatedAt = new Date();
  next();
});

export const Settings =
  mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

