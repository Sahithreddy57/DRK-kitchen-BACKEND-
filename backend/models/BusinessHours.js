

const mongoose = require("mongoose");

const businessHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    is_open: {
      type: Boolean,
      default: true,
      required: true,
    },

    open_time: {
      type: String,
      default: "10:00",
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    close_time: {
      type: String,
      default: "17:00",
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessHours", businessHoursSchema);
