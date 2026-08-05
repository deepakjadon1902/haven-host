import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      index: true,
      default: null,
    },
    hotelName: { type: String, default: "Maison Noir" },
    roomTypeName: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    nights: { type: Number, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    guestFullName: { type: String, required: true },
    guestEmail: { type: String, required: true, index: true },
    guestPhone: { type: String, required: true },
    totalCents: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },
    paymentReference: { type: String, default: null },
    paymentGateway: { type: String, default: null },
    paymentOrderId: { type: String, index: true, default: null },
    paymentId: { type: String, index: true, default: null },
    paymentVerifiedAt: { type: Date, default: null },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

bookingSchema.pre("save", function onSave(next) {
  this.updatedAt = new Date();
  next();
});

export const Booking =
  mongoose.models.Booking ?? mongoose.model("Booking", bookingSchema);
