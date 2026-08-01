import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    pricePerNightCents: { type: Number, required: true, min: 0 },
    maxAdults: { type: Number, required: true, min: 1 },
    maxChildren: { type: Number, required: true, min: 0 },
    petsAllowed: { type: Boolean, default: false },
    size: { type: String, default: null },
    bedType: { type: String, default: null },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    coverImage: { type: String, default: "" },
    totalUnits: { type: Number, default: 1, min: 1 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

roomSchema.pre("save", function onSave(next) {
  this.updatedAt = new Date();
  next();
});

export const Room = mongoose.models.Room ?? mongoose.model("Room", roomSchema);

