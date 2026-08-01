import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);

