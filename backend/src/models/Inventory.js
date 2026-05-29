import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", index: true, required: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: { type: String, enum: ["closed", "maintenance"], required: true },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

inventorySchema.index({ roomId: 1, date: 1 }, { unique: true });

inventorySchema.pre("save", function onSave(next) {
  this.updatedAt = new Date();
  next();
});

export const Inventory =
  mongoose.models.Inventory ?? mongoose.model("Inventory", inventorySchema);

