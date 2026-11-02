

// const crypto = require("crypto");
// const Customer = require("../models/Customer");
// const { success, error } = require("../utils/response");
// const generateToken = require("../utils/generateToken");

// // Development only: OTPs are stored in memory.
// // Restarting the server clears all OTPs.
// const otpStore = new Map();

// const OTP_EXPIRY_MS = 5 * 60 * 1000;
// const RESEND_COOLDOWN_MS = 30 * 1000;
// const MAX_ATTEMPTS = 5;

// const normalizeMobile = (mobile) => {
//   return String(mobile || "").replace(/\D/g, "");
// };

// // POST /api/customer/auth/send-otp
// const sendCustomerOTP = async (req, res) => {
//   try {
//     const mobile = normalizeMobile(req.body.mobile);

//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       return error(res, "Enter a valid 10-digit Indian mobile number", 400);
//     }
//     const previousOTP = otpStore.get(mobile);
//     const now = Date.now();
//     if (
//       previousOTP &&
//       now - previousOTP.createdAt < RESEND_COOLDOWN_MS
//     ) {
//       const waitSeconds = Math.ceil(
//         (RESEND_COOLDOWN_MS - (now - previousOTP.createdAt)) / 1000
//       );

//       return error(
//         res,
//         `Please wait ${waitSeconds} seconds before requesting another OTP`,
//         429
//       );
//     }
//     const otp = String(crypto.randomInt(1000, 10000));
//     otpStore.set(mobile, {
//       otp,
//       createdAt: now,
//       expiresAt: now + OTP_EXPIRY_MS,
//       attempts: 0,
//       verified: false,
//     });

//     // Development only. Never log OTPs in production.
//     console.log(`Development OTP for ${mobile}: ${otp}`);

//     return success(res, {
//       mobile,
//       isRegistered: Boolean(await Customer.exists({ mobile })),
//       message: "OTP generated successfully",
//       expiresIn: 300,
//       resendAfter: 30,
//     });
//   } catch (err) {
//     console.error("Send customer OTP error:", err);
//     return error(res, "Failed to generate OTP", 500);
//   }
// };

// // POST /api/customer/auth/verify-otp
// const verifyCustomerOTP = async (req, res) => {
//   try {
//     const mobile = normalizeMobile(req.body.mobile);
//     const { otp, name, email, gender, address } = req.body;

//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       return error(res, "Enter a valid 10-digit Indian mobile number", 400);
//     }

//     if (!/^\d{4}$/.test(String(otp || ""))) {
//       return error(res, "Enter a valid 4-digit OTP", 400);
//     }

//     const otpData = otpStore.get(mobile);

//     if (!otpData) {
//       return error(res, "Please request an OTP first", 400);
//     }

//     if (Date.now() > otpData.expiresAt) {
//       otpStore.delete(mobile);
//       return error(res, "OTP has expired. Please request a new OTP", 400);
//     }

//     if (otpData.attempts >= MAX_ATTEMPTS) {
//       otpStore.delete(mobile);
//       return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
//     }

//     if (otpData.otp !== String(otp)) {
//       otpData.attempts += 1;

//       if (otpData.attempts >= MAX_ATTEMPTS) {
//         otpStore.delete(mobile);
//         return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
//       }

//       return error(
//         res,
//         `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining`,
//         400
//       );
//     }

//     let customer = await Customer.findOne({ mobile });
//     const isNewCustomer = !customer;

//     if (!customer) {
//       if (!name || !String(name).trim()) {
//         return error(res, "Name is required", 400);
//       }

//       if (typeof email !== "string" || !email.trim()) {
//         return error(res, "Email is required", 400);
//       }

//       const normalizedEmail = email.trim().toLowerCase();
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
//         return error(res, "Enter a valid email address", 400);
//       }

//       if (typeof gender !== "string" || !gender.trim()) {
//         return error(res, "Gender is required", 400);
//       }

//       const existingEmail = await Customer.findOne({ email: normalizedEmail });
//       if (existingEmail) {
//         return error(res, "This email address is already registered", 409);
//       }

//       customer = await Customer.create({
//         name: String(name).trim(),
//         mobile,
//         email: normalizedEmail,
//         gender: String(gender).trim(),
//         ...(typeof address === "string" && address.trim()
//           ? { address: address.trim() }
//           : {}),
//       });
//     }

//     otpStore.delete(mobile);

//     const token = generateToken({
//       id: customer._id,
//       role: "customer",
//     });

//     return success(
//       res,
//       {
//         token,
//         tokenType: "Bearer",
//         customer: {
//           id: customer._id,
//           name: customer.name,
//           mobile: customer.mobile,
//           email: customer.email,
//           gender: customer.gender,
//           address: customer.address,
//         },
//       },
//       isNewCustomer
//         ? "OTP verified, customer registered, and login successful"
//         : "OTP verified and login successful",
//       isNewCustomer ? 201 : 200
//     );
//   } catch (err) {
//     console.error("Verify customer OTP error:", err);

//     if (err.code === 11000) {
//       return error(res, "Customer already exists", 409);
//     }

//     return error(res, "Failed to verify OTP", 500);
//   }
// };

// // POST /api/customer/auth/change-mobile/send-otp
// const sendMobileChangeOTP = async (req, res) => {
//   try {
//     const mobile = normalizeMobile(req.body.mobile);

//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       return error(res, "Enter a valid 10-digit Indian mobile number", 400);
//     }

//     if (mobile === req.customer.mobile) {
//       return error(res, "Enter a different mobile number", 400);
//     }

//     if (await Customer.exists({ mobile })) {
//       return error(res, "This mobile number is already registered", 409);
//     }

//     const key = `mobile-change:${req.customer._id}`;
//     const previousOTP = otpStore.get(key);
//     const now = Date.now();

//     if (previousOTP && now - previousOTP.createdAt < RESEND_COOLDOWN_MS) {
//       const waitSeconds = Math.ceil(
//         (RESEND_COOLDOWN_MS - (now - previousOTP.createdAt)) / 1000
//       );

//       return error(
//         res,
//         `Please wait ${waitSeconds} seconds before requesting another OTP`,
//         429
//       );
//     }

//     const otp = String(crypto.randomInt(1000, 10000));

//     otpStore.set(key, {
//       otp,
//       mobile,
//       customerId: String(req.customer._id),
//       createdAt: now,
//       expiresAt: now + OTP_EXPIRY_MS,
//       attempts: 0,
//     });

//     // Development only. Never log OTPs in production.
//     console.log(`Development mobile-change OTP for ${mobile}: ${otp}`);

//     return success(res, {
//       mobile,
//       expiresIn: 300,
//       resendAfter: 30,
//       message: "OTP generated successfully",
//     });
//   } catch (err) {
//     console.error("Send mobile change OTP error:", err);
//     return error(res, "Failed to generate mobile change OTP", 500);
//   }
// };

// // POST /api/customer/auth/change-mobile/verify-otp
// const verifyMobileChangeOTP = async (req, res) => {
//   try {
//     const mobile = normalizeMobile(req.body.mobile);
//     const { otp } = req.body;
//     const key = `mobile-change:${req.customer._id}`;
//     const otpData = otpStore.get(key);

//     if (!/^[6-9]\d{9}$/.test(mobile)) {
//       return error(res, "Enter a valid 10-digit Indian mobile number", 400);
//     }

//     if (!/^\d{4}$/.test(String(otp || ""))) {
//       return error(res, "Enter a valid 4-digit OTP", 400);
//     }

//     if (
//       !otpData ||
//       otpData.customerId !== String(req.customer._id) ||
//       otpData.mobile !== mobile
//     ) {
//       return error(res, "Please request an OTP for this mobile number first", 400);
//     }

//     if (Date.now() > otpData.expiresAt) {
//       otpStore.delete(key);
//       return error(res, "OTP has expired. Please request a new OTP", 400);
//     }

//     if (otpData.attempts >= MAX_ATTEMPTS) {
//       otpStore.delete(key);
//       return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
//     }

//     if (otpData.otp !== String(otp)) {
//       otpData.attempts += 1;

//       if (otpData.attempts >= MAX_ATTEMPTS) {
//         otpStore.delete(key);
//         return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
//       }

//       return error(
//         res,
//         `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining`,
//         400
//       );
//     }

//     if (await Customer.exists({ mobile, _id: { $ne: req.customer._id } })) {
//       otpStore.delete(key);
//       return error(res, "This mobile number is already registered", 409);
//     }

//     req.customer.mobile = mobile;
//     await req.customer.save();
//     otpStore.delete(key);

//     return success(
//       res,
//       {
//         customer: {
//           id: req.customer._id,
//           name: req.customer.name,
//           mobile: req.customer.mobile,
//           email: req.customer.email,
//           gender: req.customer.gender,
//           address: req.customer.address,
//         },
//       },
//       "Mobile number updated successfully"
//     );
//   } catch (err) {
//     console.error("Verify mobile change OTP error:", err);
//     return error(res, "Failed to update mobile number", 500);
//   }
// };

// module.exports = {
//   sendCustomerOTP,
//   verifyCustomerOTP,
//   sendMobileChangeOTP,
//   verifyMobileChangeOTP,
// };
const crypto = require("crypto");
const Customer = require("../models/Customer");
const { success, error } = require("../utils/response");
const generateToken = require("../utils/generateToken");

// NEW: verified mobile history
const {
  MobileUsedError,
  sendMobileUsed,
  getMobileState,
  claimMobileForNewCustomer,
  rollbackClaim,
  ensureActiveRecord,
  assertMobileUsableForChange,
  changeCustomerMobile,
  revertMobileChange,
  newCustomerId,
} = require("../utils/mobileHistory");

// Development only: OTPs are stored in memory.
// Restarting the server clears all OTPs.
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

const normalizeMobile = (mobile) => {
  return String(mobile || "").replace(/\D/g, "");
};

// POST /api/customer/auth/send-otp
const sendCustomerOTP = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return error(res, "Enter a valid 10-digit Indian mobile number", 400);
    }

    // NEW: ఈ number కి ఇప్పుడు customer లేకపోతే, అది కొత్త registration.
    // History లో ఏ status లో ఉన్నా (ACTIVE stale అయినా, INACTIVE అయినా) అది "used" -> 409.
    const existingCustomer = await Customer.exists({ mobile });

    if (!existingCustomer) {
      const { state } = await getMobileState(mobile);
      console.log(`[MOBILE HISTORY] send-otp ${mobile}: customer=none, history=${state}`);

      if (state !== "NEW") {
        return sendMobileUsed(res);
      }
    }

    const previousOTP = otpStore.get(mobile);
    const now = Date.now();
    if (
      previousOTP &&
      now - previousOTP.createdAt < RESEND_COOLDOWN_MS
    ) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - previousOTP.createdAt)) / 1000
      );

      return error(
        res,
        `Please wait ${waitSeconds} seconds before requesting another OTP`,
        429
      );
    }
    const otp = String(crypto.randomInt(1000, 10000));
    otpStore.set(mobile, {
      otp,
      createdAt: now,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
      verified: false,
    });

    // Development only. Never log OTPs in production.
    console.log(`Development OTP for ${mobile}: ${otp}`);

    return success(res, {
      mobile,
      isRegistered: Boolean(existingCustomer),
      message: "OTP generated successfully",
      expiresIn: 300,
      resendAfter: 30,
    });
  } catch (err) {
    console.error("Send customer OTP error:", err);
    return error(res, "Failed to generate OTP", 500);
  }
};

// POST /api/customer/auth/verify-otp
const verifyCustomerOTP = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    const { otp, name, email, gender, address } = req.body;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return error(res, "Enter a valid 10-digit Indian mobile number", 400);
    }

    if (!/^\d{4}$/.test(String(otp || ""))) {
      return error(res, "Enter a valid 4-digit OTP", 400);
    }

    const otpData = otpStore.get(mobile);

    if (!otpData) {
      return error(res, "Please request an OTP first", 400);
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(mobile);
      return error(res, "OTP has expired. Please request a new OTP", 400);
    }

    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(mobile);
      return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
    }

    if (otpData.otp !== String(otp)) {
      otpData.attempts += 1;

      if (otpData.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(mobile);
        return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
      }

      return error(
        res,
        `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining`,
        400
      );
    }

    let customer = await Customer.findOne({ mobile });
    const isNewCustomer = !customer;

    if (!customer) {
      // NEW: ఇది కొత్త registration. history లో ఉన్న (ACTIVE లేదా INACTIVE) number అయితే reject
      const { state } = await getMobileState(mobile);
      console.log(`[MOBILE HISTORY] verify-otp ${mobile}: customer=none, history=${state}`);

      if (state !== "NEW") {
        otpStore.delete(mobile);
        return sendMobileUsed(res);
      }

      if (!name || !String(name).trim()) {
        return error(res, "Name is required", 400);
      }

      if (typeof email !== "string" || !email.trim()) {
        return error(res, "Email is required", 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return error(res, "Enter a valid email address", 400);
      }

      if (typeof gender !== "string" || !gender.trim()) {
        return error(res, "Gender is required", 400);
      }

      const existingEmail = await Customer.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return error(res, "This email address is already registered", 409);
      }

      // NEW: DB unique index తో number ని atomic గా claim చేయి (race conditions ఆపుతుంది)
      const customerId = newCustomerId();
      let claim;
      try {
        claim = await claimMobileForNewCustomer(mobile, customerId);
      } catch (e) {
        if (e instanceof MobileUsedError) {
          otpStore.delete(mobile);
          return sendMobileUsed(res);
        }
        throw e;
      }

      try {
        customer = await Customer.create({
          _id: customerId,
          name: String(name).trim(),
          mobile,
          email: normalizedEmail,
          gender: String(gender).trim(),
          ...(typeof address === "string" && address.trim()
            ? { address: address.trim() }
            : {}),
        });
      } catch (e) {
        await rollbackClaim(claim); // customer create కాకపోతే claim వెనక్కి
        throw e;
      }
    } else {
      // NEW: ఇప్పటికే ఉన్న customer login. history లో లేకపోతే నమోదు చేయి
      await ensureActiveRecord(customer._id, mobile);
    }

    otpStore.delete(mobile);

    const token = generateToken({
      id: customer._id,
      role: "customer",
    });

    return success(
      res,
      {
        token,
        tokenType: "Bearer",
        customer: {
          id: customer._id,
          name: customer.name,
          mobile: customer.mobile,
          email: customer.email,
          gender: customer.gender,
          address: customer.address,
        },
      },
      isNewCustomer
        ? "OTP verified, customer registered, and login successful"
        : "OTP verified and login successful",
      isNewCustomer ? 201 : 200
    );
  } catch (err) {
    console.error("Verify customer OTP error:", err);

    if (err.code === 11000) {
      return error(res, "Customer already exists", 409);
    }

    return error(res, "Failed to verify OTP", 500);
  }
};

// POST /api/customer/auth/change-mobile/send-otp
const sendMobileChangeOTP = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return error(res, "Enter a valid 10-digit Indian mobile number", 400);
    }

    if (mobile === req.customer.mobile) {
      return error(res, "Enter a different mobile number", 400);
    }

    if (await Customer.exists({ mobile })) {
      return error(res, "This mobile number is already registered", 409);
    }

    // NEW: వేరే customer వాడిన (INACTIVE) number కి OTP పంపకుండానే reject
    try {
      await assertMobileUsableForChange(req.customer._id, mobile);
    } catch (e) {
      if (e instanceof MobileUsedError) return sendMobileUsed(res);
      throw e;
    }

    const key = `mobile-change:${req.customer._id}`;
    const previousOTP = otpStore.get(key);
    const now = Date.now();

    if (previousOTP && now - previousOTP.createdAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - previousOTP.createdAt)) / 1000
      );

      return error(
        res,
        `Please wait ${waitSeconds} seconds before requesting another OTP`,
        429
      );
    }

    const otp = String(crypto.randomInt(1000, 10000));

    otpStore.set(key, {
      otp,
      mobile,
      customerId: String(req.customer._id),
      createdAt: now,
      expiresAt: now + OTP_EXPIRY_MS,
      attempts: 0,
    });

    // Development only. Never log OTPs in production.
    console.log(`Development mobile-change OTP for ${mobile}: ${otp}`);

    return success(res, {
      mobile,
      expiresIn: 300,
      resendAfter: 30,
      message: "OTP generated successfully",
    });
  } catch (err) {
    console.error("Send mobile change OTP error:", err);
    return error(res, "Failed to generate mobile change OTP", 500);
  }
};

// POST /api/customer/auth/change-mobile/verify-otp
const verifyMobileChangeOTP = async (req, res) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    const { otp } = req.body;
    const key = `mobile-change:${req.customer._id}`;
    const otpData = otpStore.get(key);

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return error(res, "Enter a valid 10-digit Indian mobile number", 400);
    }

    if (!/^\d{4}$/.test(String(otp || ""))) {
      return error(res, "Enter a valid 4-digit OTP", 400);
    }

    if (
      !otpData ||
      otpData.customerId !== String(req.customer._id) ||
      otpData.mobile !== mobile
    ) {
      return error(res, "Please request an OTP for this mobile number first", 400);
    }

    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(key);
      return error(res, "OTP has expired. Please request a new OTP", 400);
    }

    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(key);
      return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
    }

    if (otpData.otp !== String(otp)) {
      otpData.attempts += 1;

      if (otpData.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(key);
        return error(res, "Maximum OTP attempts exceeded. Request a new OTP", 429);
      }

      return error(
        res,
        `Invalid OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining`,
        400
      );
    }

    if (await Customer.exists({ mobile, _id: { $ne: req.customer._id } })) {
      otpStore.delete(key);
      return error(res, "This mobile number is already registered", 409);
    }

    // NEW: history update (పాత number INACTIVE, కొత్తది ACTIVE, ఏదీ delete కాదు)
    const oldMobile = req.customer.mobile;
    try {
      await changeCustomerMobile(req.customer._id, mobile, oldMobile);
      console.log(`[MOBILE HISTORY] changed ${oldMobile} -> ${mobile} (old is now INACTIVE)`);
    } catch (e) {
      if (e instanceof MobileUsedError) {
        otpStore.delete(key);
        return sendMobileUsed(res);
      }
      throw e;
    }

    try {
      req.customer.mobile = mobile;
      await req.customer.save();
    } catch (e) {
      // customer save విఫలమైతే history ని వెనక్కి తెచ్చి error ఇవ్వండి
      req.customer.mobile = oldMobile;
      await revertMobileChange(req.customer._id, oldMobile, mobile);
      throw e;
    }

    otpStore.delete(key);

    return success(
      res,
      {
        customer: {
          id: req.customer._id,
          name: req.customer.name,
          mobile: req.customer.mobile,
          email: req.customer.email,
          gender: req.customer.gender,
          address: req.customer.address,
        },
      },
      "Mobile number updated successfully"
    );
  } catch (err) {
    console.error("Verify mobile change OTP error:", err);
    return error(res, "Failed to update mobile number", 500);
  }
};

module.exports = {
  sendCustomerOTP,
  verifyCustomerOTP,
  sendMobileChangeOTP,
  verifyMobileChangeOTP,
};