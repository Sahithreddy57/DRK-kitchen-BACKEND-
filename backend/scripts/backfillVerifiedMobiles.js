require("dotenv").config();
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const VerifiedMobile = require("../models/VerifiedMobile");
const { normalizeMobile } = require("../utils/mobileHistory");

(async () => {
  // మీ Mongo URL env పేరు వేరే అయితే మార్చండి
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  await VerifiedMobile.init(); // unique index ఉందని నిర్ధారించు

  const customers = await Customer.find({}).select("_id mobile").lean();
  let added = 0, skipped = 0;
  const conflicts = [];

  for (const c of customers) {
    const mobile = normalizeMobile(c.mobile);
    if (mobile.length !== 10) { skipped += 1; continue; }

    const res = await VerifiedMobile.updateOne(
      { mobile },
      { $setOnInsert: { mobile, customer_id: c._id, status: "ACTIVE", verified_at: new Date() } },
      { upsert: true }
    );

    if (res.upsertedCount) {
      added += 1;
    } else {
      const owner = await VerifiedMobile.findOne({ mobile }).lean();
      if (String(owner.customer_id) !== String(c._id)) {
        conflicts.push({ mobile, customer: String(c._id), already_owned_by: String(owner.customer_id) });
      }
    }
  }
  console.log({ total: customers.length, added, skipped_invalid: skipped });
  if (conflicts.length) console.log("CONFLICTS (ఒకే number తో రెండు customers):", conflicts);
  await mongoose.disconnect();
})();