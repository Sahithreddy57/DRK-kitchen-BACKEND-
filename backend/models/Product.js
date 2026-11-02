

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image_url: {
      type: String,
    },
    display_order: {
      type: Number,
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
    preorder_above_kg: {
      type: Number,
      min: 0,
    },
    min_prep_hours: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Product stock quantity
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ category_id: 1, status: 1 });

module.exports = mongoose.model("Product", productSchema);
