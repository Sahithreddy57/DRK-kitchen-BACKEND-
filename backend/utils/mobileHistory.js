const mongoose = require("mongoose");
const VerifiedMobile = require("../models/VerifiedMobile");

// ఒక customer తన సొంత పాత (INACTIVE) number కి తిరిగి మారొచ్చా?
// true = అనుమతి (వేరే వారికి ఎప్పుడూ కాదు). Team "కాదు" అంటే false చేయండి.
const ALLOW_OWN_PREVIOUS_NUMBER = true;

const MOBILE_USED_MESSAGE =
  "This number was previously used. Please use your current registered number or use different mobile number.";

// +91 / spaces / dashes తీసేసి చివరి 10 అంకెలు
const normalizeMobile = (value) =>
  String(value || "").replace(/\D/g, "").slice(-10);

class MobileUsedError extends Error {
  constructor() {
    super(MOBILE_USED_MESSAGE);
    this.statusCode = 409;
    this.code = "MOBILE_NUMBER_ALREADY_USED";
  }
}

const isDuplicateKey = (e) => e && (e.code === 11000 || e.code === 11001);

// Team అడిగిన ఖచ్చితమైన 409 response
const sendMobileUsed = (res) =>
  res.status(409).json({
    success: false,
    code: "MOBILE_NUMBER_ALREADY_USED",
    message: MOBILE_USED_MESSAGE,
  });

// ఈ number ఎప్పుడైనా వాడారా? -> { state: "NEW" | "ACTIVE" | "INACTIVE", customer_id }
const getMobileState = async (mobile) => {
  const doc = await VerifiedMobile.findOne({ mobile: normalizeMobile(mobile) }).lean();
  if (!doc) return { state: "NEW", customer_id: null };
  return { state: doc.status, customer_id: doc.customer_id };
};

// కొత్త customer registration: OTP verify అయ్యాక, customer create చేసే ముందు.
// number history లో ఉంటే (ACTIVE లేదా INACTIVE) MobileUsedError వస్తుంది.
const claimMobileForNewCustomer = async (mobile, customerId) => {
  try {
    return await VerifiedMobile.create({
      mobile: normalizeMobile(mobile),
      customer_id: customerId,
      status: "ACTIVE",
    });
  } catch (e) {
    if (isDuplicateKey(e)) throw new MobileUsedError();
    throw e;
  }
};

// Customer create విఫలమైతే ఈ request లో చేసిన claim ని మాత్రమే వెనక్కి తీయడానికి
// (native delete; model hook block ని ఉద్దేశపూర్వకంగా దాటుతుంది)
const rollbackClaim = async (claimDoc) => {
  if (claimDoc && claimDoc._id) {
    await VerifiedMobile.collection.deleteOne({ _id: claimDoc._id });
  }
};

// ఇప్పటికే ఉన్న (backfill కాని) customer కోసం history record లేకపోతే add చేస్తుంది
const ensureActiveRecord = async (customerId, mobile) => {
  const m = normalizeMobile(mobile);
  try {
    await VerifiedMobile.updateOne(
      { mobile: m },
      {
        $setOnInsert: {
          mobile: m,
          customer_id: customerId,
          status: "ACTIVE",
          verified_at: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (e) {
    if (!isDuplicateKey(e)) throw e;
  }
};

// Number మార్చే OTP పంపే ముందు: ఈ number ఈ customer కి వాడొచ్చా?
const assertMobileUsableForChange = async (customerId, mobile) => {
  const { state, customer_id } = await getMobileState(mobile);
  if (state === "NEW") return;
  if (ALLOW_OWN_PREVIOUS_NUMBER && String(customer_id) === String(customerId)) return;
  throw new MobileUsedError();
};

// Number మార్పు: కొత్త number OTP verify అయ్యాక పిలవండి.
// పాత number delete కాదు, INACTIVE అవుతుంది. కొత్తది ACTIVE అవుతుంది.
const changeCustomerMobile = async (customerId, newMobile, oldMobile) => {
  const mobile = normalizeMobile(newMobile);

  // పాత number history లో లేకపోతే (backfill కాని customer) ముందు నమోదు చేయి
  if (oldMobile) await ensureActiveRecord(customerId, oldMobile);

  const existing = await VerifiedMobile.findOne({ mobile });

  if (existing) {
    const own = String(existing.customer_id) === String(customerId);
    if (!own || (!ALLOW_OWN_PREVIOUS_NUMBER && existing.status !== "ACTIVE")) {
      throw new MobileUsedError();
    }
    if (existing.status !== "ACTIVE") {
      existing.status = "ACTIVE";
      existing.deactivated_at = null;
      existing.verified_at = new Date();
      await existing.save();
    }
  } else {
    try {
      await VerifiedMobile.create({ mobile, customer_id: customerId, status: "ACTIVE" });
    } catch (e) {
      if (isDuplicateKey(e)) throw new MobileUsedError(); // race: మరొకరు ముందే తీసుకున్నారు
      throw e;
    }
  }

  // ఈ customer యొక్క మిగతా ACTIVE numbers అన్నీ INACTIVE అవుతాయి (delete కావు)
  await VerifiedMobile.updateMany(
    { customer_id: customerId, mobile: { $ne: mobile }, status: "ACTIVE" },
    { $set: { status: "INACTIVE", deactivated_at: new Date() } }
  );

  return mobile;
};

// Customer.save() విఫలమైతే history ని పాత స్థితికి తెస్తుంది
// (కొత్త number "used" గానే ఉంటుంది, అది verify అయింది కాబట్టి)
const revertMobileChange = async (customerId, oldMobile, newMobile) => {
  await VerifiedMobile.updateOne(
    { mobile: normalizeMobile(oldMobile), customer_id: customerId },
    { $set: { status: "ACTIVE", deactivated_at: null } }
  );
  await VerifiedMobile.updateOne(
    { mobile: normalizeMobile(newMobile), customer_id: customerId },
    { $set: { status: "INACTIVE", deactivated_at: new Date() } }
  );
};

module.exports = {
  normalizeMobile,
  MobileUsedError,
  sendMobileUsed,
  getMobileState,
  claimMobileForNewCustomer,
  rollbackClaim,
  ensureActiveRecord,
  assertMobileUsableForChange,
  changeCustomerMobile,
  revertMobileChange,
  newCustomerId: () => new mongoose.Types.ObjectId(),
};