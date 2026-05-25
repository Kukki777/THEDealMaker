const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: String },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    purpose: { type: String, enum: ["rent", "sale"], required: true },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "plot", "commercial"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    areaSqFt: { type: Number, min: 0 },
    amenities: [{ type: String, trim: true }],
    images: [imageSchema],
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "sold", "rented"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, purpose: 1, price: 1, status: 1 });
propertySchema.index({ title: "text", description: "text", locality: "text" });

module.exports = mongoose.model("Property", propertySchema);
