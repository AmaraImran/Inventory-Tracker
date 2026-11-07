import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [saleItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    profit: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "online"], default: "cash" },
  },
  { timestamps: true }
);

saleSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Sale", saleSchema);