// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const path = require("path");
// const adminAuthRoutes = require("./routes/admin/authRoutes");
// const categoryRoutes = require("./Routes/admin/categoryRoutes");
// const productRoutes = require("./Routes/admin/productRoutes");
// const variantRoutes = require("./Routes/admin/variantRoutes");
// const hundiRoutes = require("./Routes/admin/hundiRoutes");
// const orderRoutes = require("./Routes/admin/orderRoutes");
// const paymentRoutes = require("./Routes/admin/paymentRoutes");
// const customerRoutes = require("./Routes/admin/customerRoutes");
// const dashboardRoutes = require("./Routes/admin/dashboardRoutes");
// const settingsRoutes = require("./Routes/admin/settingsRoutes");
// const auditRoutes = require("./Routes/admin/auditRoutes");
// const customerAuthRoutes = require("./Routes/admin/customerAuthRoutes");
// const customerAddressRoutes = require("./Routes/admin/customerAddressRoutes");

 
  

// const app = express();

// app.use(cors({
//   origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("DRK-Kitchen API is running");
// });
// // Static uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/admin/auth", adminAuthRoutes);
// app.use("/api/admin/dashboard", dashboardRoutes);
// app.use("/api/admin/categories", categoryRoutes);
// app.use("/api/admin/products", productRoutes);
// app.use("/api/admin/variants", variantRoutes);
// app.use("/api/admin/hundi", hundiRoutes);
// app.use("/api/admin/orders", orderRoutes);
// app.use("/api/admin/payments", paymentRoutes);
// app.use("/api/admin/customers", customerRoutes);
// app.use("/api/admin/settings", settingsRoutes);
// app.use("/api/admin/audit-logs", auditRoutes);
// app.use("/api/customer/auth", customerAuthRoutes);
// app.use("/api/customer/addresses", customerAddressRoutes);
  
// connectDB();
// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const connectDB = require("./config/db");
// const path = require("path");
// const adminAuthRoutes = require("./routes/admin/authRoutes");
// const categoryRoutes = require("./Routes/admin/categoryRoutes");
// const productRoutes = require("./Routes/admin/productRoutes");
// const variantRoutes = require("./Routes/admin/variantRoutes");
// const hundiRoutes = require("./Routes/admin/hundiRoutes");
// const orderRoutes = require("./Routes/admin/orderRoutes");
// const preorderScheduleRoutes = require("./Routes/admin/preorderScheduleRoutes");
// const paymentRoutes = require("./Routes/admin/paymentRoutes");
// const customerRoutes = require("./Routes/admin/customerRoutes");
// const dashboardRoutes = require("./Routes/admin/dashboardRoutes");
// const settingsRoutes = require("./Routes/admin/settingsRoutes");
// const auditRoutes = require("./Routes/admin/auditRoutes");
// const customerAuthRoutes = require("./Routes/admin/customerAuthRoutes");
// const customerAddressRoutes = require("./Routes/admin/customerAddressRoutes");
// const customerOrderRoutes = require("./Routes/admin/customerOrderRoutes");
// const customerMenuRoutes = require("./Routes/admin/customerMenuRoutes");
// const customerKitchenRoutes = require("./Routes/admin/customerKitchenRoutes");
// const app = express();

// app.use(cors({
//   origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("DRK-Kitchen API is running");
// });
// // Static uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Admin routes (admin token only)
// app.use("/api/admin/auth", adminAuthRoutes);
// app.use("/api/admin/dashboard", dashboardRoutes);
// app.use("/api/admin/categories", categoryRoutes);
// app.use("/api/admin/products", productRoutes);
// app.use("/api/admin/variants", variantRoutes);
// app.use("/api/admin/hundi", hundiRoutes);
// app.use("/api/admin/orders", orderRoutes);
// app.use("/api/admin/preorder-schedule", preorderScheduleRoutes);
// app.use("/api/admin/payments", paymentRoutes);
// app.use("/api/admin/customers", customerRoutes);
// app.use("/api/admin/settings", settingsRoutes);
// app.use("/api/admin/audit-logs", auditRoutes);
// app.use("/api/customer/menu", customerMenuRoutes);
// // Customer app routes (customer OTP token only)
// app.use("/api/customer/auth", customerAuthRoutes);
// app.use("/api/customer/addresses", customerAddressRoutes);
// app.use("/api/customer/orders", customerOrderRoutes);
// app.use("/api/customer/kitchen", customerKitchenRoutes);


// connectDB();
// app.listen(5000, () => {
//     console.log("Server running on port 5000");
// });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const adminAuthRoutes = require("./routes/admin/authRoutes");
const categoryRoutes = require("./Routes/admin/categoryRoutes");
const productRoutes = require("./Routes/admin/productRoutes");
const variantRoutes = require("./Routes/admin/variantRoutes");
const hundiRoutes = require("./Routes/admin/hundiRoutes");
const orderRoutes = require("./Routes/admin/orderRoutes");
const preorderScheduleRoutes = require("./Routes/admin/preorderScheduleRoutes");
const paymentRoutes = require("./Routes/admin/paymentRoutes");
const customerRoutes = require("./Routes/admin/customerRoutes");
const dashboardRoutes = require("./Routes/admin/dashboardRoutes");
const settingsRoutes = require("./Routes/admin/settingsRoutes");
const auditRoutes = require("./Routes/admin/auditRoutes");
const customerAuthRoutes = require("./Routes/admin/customerAuthRoutes");
const customerAddressRoutes = require("./Routes/admin/customerAddressRoutes");
const customerOrderRoutes = require("./Routes/admin/customerOrderRoutes");
const customerMenuRoutes = require("./Routes/admin/customerMenuRoutes");
const customerKitchenRoutes = require("./Routes/admin/customerKitchenRoutes");
const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("DRK-Kitchen API is running");
});
// Static uploads (uploads/products, uploads/hundi and older files in uploads/)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Admin routes (admin token only)
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/variants", variantRoutes);
app.use("/api/admin/hundi", hundiRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/preorder-schedule", preorderScheduleRoutes);
app.use("/api/admin/payments", paymentRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/audit-logs", auditRoutes);
app.use("/api/customer/menu", customerMenuRoutes);
// Customer app routes (customer OTP token only)
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/customer/addresses", customerAddressRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/kitchen", customerKitchenRoutes);

// Upload errors (wrong file type, file too large) -> JSON instead of an HTML error page
app.use((err, req, res, next) => {
  const isUploadError =
    err && (err.name === "MulterError" || /Invalid file type/i.test(err.message || ""));

  if (!isUploadError) return next(err);

  const tooLarge = err.code === "LIMIT_FILE_SIZE";

  return res.status(400).json({
    success: false,
    code: tooLarge ? "FILE_TOO_LARGE" : "INVALID_FILE",
    message: tooLarge ? "Image must be 5 MB or smaller." : err.message,
  });
});

connectDB();
app.listen(5000, () => {
    console.log("Server running on port 5000");
});