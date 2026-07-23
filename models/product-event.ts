import mongoose from "mongoose";

export const PRODUCT_EVENT_NAMES = [
  "chat_submitted",
  "image_analysis_completed",
  "text_analysis_completed",
  "registration_completed",
  "login_completed",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

const productEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: PRODUCT_EVENT_NAMES,
      required: true,
      index: true,
    },
    authenticated: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

productEventSchema.index({ event: 1, createdAt: -1 });

export const ProductEvent =
  mongoose.models.ProductEvent ||
  mongoose.model("ProductEvent", productEventSchema);
