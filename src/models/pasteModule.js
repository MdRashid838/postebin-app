import mongoose from "mongoose";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const pasteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    // Default: 24 hours expiry
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + TWENTY_FOUR_HOURS),
    },

    // Default: max 5 views
    maxViews: {
      type: Number,
      default: 5,
      min: 1,
    },

    // Current views count
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);


//  Indexes
pasteSchema.index({ expiresAt: 1 });
pasteSchema.index({ maxViews: 1 });

// check expiry
pasteSchema.methods.isExpired = function (now = new Date()) {
  return now > this.expiresAt;
};

//  check view limit
pasteSchema.methods.isViewLimitExceeded = function () {
  return this.views >= this.maxViews;
};

const Paste = mongoose.model("Paste", pasteSchema);

export default Paste;
