

const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_type: {
      type: String,
      required: true,
      trim: true,
    },
    variant_name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity_value: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity_unit: {
      type: String,
      required: true,
      trim: true,
    },
    member_count: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    availability: {
      type: Boolean,
      default: true,
    },
    // "instock" = order now, "preorder" = must be booked in advance
    order_type: {
      type: String,
      enum: ["instock", "preorder"],
      default: "instock",
    },
  },
  { timestamps: true }
);

productVariantSchema.index({ product_id: 1, status: 1 });

// Prevent the same variant name from being created twice
// for the same product, regardless of status.
productVariantSchema.index(
  { product_id: 1, variant_name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);