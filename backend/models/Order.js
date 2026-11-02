
// const mongoose = require("mongoose");

// const {
//   ORDER_STATUS,
//   ORDER_TYPES,
//   PAYMENT_STATUS,
// } = require("../utils/constants");

// let counter = 0;

// const orderSchema = new mongoose.Schema(
//   {
//     order_number: {
//       type: String,
//       unique: true,
//     },

//     customer_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       required: true,
//     },

//     order_type: {
//       type: String,
//       enum: Object.values(ORDER_TYPES),
//       required: true,
//     },

//     // Customer requested date and time
//     // For pre-orders: start of the selected slot
//     requested_at: {
//       type: Date,
//     },

//     // Pickup or delivery
//     fulfillment_type: {
//       type: String,
//       enum: ["PICKUP", "DELIVERY"],
//       default: "PICKUP",
//       required: true,
//     },

//     // Delivery address snapshot
//     delivery_address: {
//       label: {
//         type: String,
//         trim: true,
//       },
//       house_flat_no: {
//         type: String,
//         trim: true,
//       },
//       street_area: {
//         type: String,
//         trim: true,
//       },
//       landmark: {
//         type: String,
//         trim: true,
//       },
//       pincode: {
//         type: String,
//         trim: true,
//       },
//     },

//     // Order status
//     status: {
//       type: String,
//       enum: Object.values(ORDER_STATUS),
//       default: ORDER_STATUS.NEW,
//     },

//     // Payment status
//     payment_status: {
//       type: String,
//       enum: Object.values(PAYMENT_STATUS),
//       default: PAYMENT_STATUS.PENDING,
//     },

//     // Item amount before additional charges
//     subtotal: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     // Packing charge
//     packing_charge: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     // Delivery charge
//     delivery_charge: {
//       type: Number,
//       min: 0,
//       default: 0,
//     },

//     // Final amount = subtotal + packing + delivery
//     total_amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     notes: {
//       type: String,
//       trim: true,
//     },

//     // Prevent duplicate order creation when the same
//     // idempotency key is reused
//     idempotency_key: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },

//     // Pre-order and Hundi fields
//     has_hundi: {
//       type: Boolean,
//       default: false,
//     },

//     kot_printed_at: {
//       type: Date,
//     },

//     cancelled_at: {
//       type: Date,
//     },
// // Set when kitchen preparation actually starts
// preparation_started_at: {
//   type: Date,
//   default: null,
// },
//     cancel_reason: {
//       type: String,
//       trim: true,
//     },

//     refund_status: {
//       type: String,
//       enum: ["none", "pending", "refunded"],
//       default: "none",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// orderSchema.index({
//   status: 1,
//   payment_status: 1,
//   order_type: 1,
//   createdAt: -1,
//   requested_at: 1,
// });

// orderSchema.index({
//   order_type: 1,
//   requested_at: 1,
// });

// orderSchema.index({
//   customer_id: 1,
// });


// // Generate order number before saving
// // IMPORTANT: No next() callback is required here.
// orderSchema.pre("save", function () {
//   if (!this.order_number) {
//     const prefix = process.env.ORDER_PREFIX || "DRK";
//     const timestamp = Date.now().toString().slice(-6);

//     counter = (counter + 1) % 1000;

//     this.order_number =
//       `${prefix}-${timestamp}${String(counter).padStart(3, "0")}`;
//   }
// });

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const {
  ORDER_STATUS,
  ORDER_TYPES,
  PAYMENT_STATUS,
} = require("../utils/constants");

const BusinessSetting = require("./BusinessSetting");

let counter = 0;

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      unique: true,
    },

    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    order_type: {
      type: String,
      enum: Object.values(ORDER_TYPES),
      required: true,
    },

    // Customer requested date and time
    // For pre-orders: start of the selected slot
    requested_at: {
      type: Date,
    },

    // Pickup or delivery
    fulfillment_type: {
      type: String,
      enum: ["PICKUP", "DELIVERY"],
      default: "PICKUP",
      required: true,
    },

    // Delivery address snapshot
    delivery_address: {
      label: {
        type: String,
        trim: true,
      },
      house_flat_no: {
        type: String,
        trim: true,
      },
      street_area: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },

    // Order status
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.NEW,
    },

    // Payment status
    payment_status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    // Item amount before additional charges
    subtotal: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Packing charge
    packing_charge: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Delivery charge
    delivery_charge: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Final amount = subtotal + packing + delivery
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
    },

    // Prevent duplicate order creation when the same
    // idempotency key is reused
    idempotency_key: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Pre-order and Hundi fields
    has_hundi: {
      type: Boolean,
      default: false,
    },

    kot_printed_at: {
      type: Date,
    },

    cancelled_at: {
      type: Date,
    },

    // Set when kitchen preparation actually starts
    preparation_started_at: {
      type: Date,
      default: null,
    },

    cancel_reason: {
      type: String,
      trim: true,
    },

    refund_status: {
      type: String,
      enum: ["none", "pending", "refunded"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({
  status: 1,
  payment_status: 1,
  order_type: 1,
  createdAt: -1,
  requested_at: 1,
});

orderSchema.index({
  order_type: 1,
  requested_at: 1,
});

orderSchema.index({
  customer_id: 1,
});

// Generate dynamic order number before saving
orderSchema.pre("save", async function () {
  // Generate only when order_number is not already available
  if (!this.order_number) {
    // Get latest prefix from Admin Settings
    const setting = await BusinessSetting.findOne({
      key: "order_prefix",
    })
      .select("value")
      .lean();

    // Use saved prefix, fallback to environment variable, then DRK
    const prefix = String(
      setting?.value || process.env.ORDER_PREFIX || "DRK"
    )
      .trim()
      .toUpperCase();

    const timestamp = Date.now().toString().slice(-6);

    counter = (counter + 1) % 1000;

    this.order_number =
      `${prefix}-${timestamp}${String(counter).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
