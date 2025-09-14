const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    planType: {
      type: String,
      enum: ["basic", "premium", "enterprise", "custom"],
      required: true,
    },
    pricing: {
      monthly: {
        type: Number,
        required: true,
        min: 0,
      },
      yearly: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "NPR"],
      },
    },
    features: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        included: {
          type: Boolean,
          default: true,
        },
        limit: {
          type: String,
          default: null, // e.g., "unlimited", "100GB", "5 users"
        },
      },
    ],
    billingCycles: [
      {
        type: String,
        enum: ["monthly", "yearly", "quarterly", "weekly"],
        default: ["monthly", "yearly"],
      },
    ],
    trialPeriod: {
      enabled: {
        type: Boolean,
        default: false,
      },
      days: {
        type: Number,
        min: 0,
        max: 365,
        default: 0,
      },
    },
    limits: {
      maxUsers: {
        type: Number,
        min: 1,
        default: null,
      },
      maxStorage: {
        type: String,
        default: null, // e.g., "10GB", "unlimited"
      },
      maxApiCalls: {
        type: Number,
        default: null,
      },
      maxProjects: {
        type: Number,
        default: null,
      },
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
subscriptionPlanSchema.index({ name: 1 });
subscriptionPlanSchema.index({ planType: 1 });
subscriptionPlanSchema.index({ isActive: 1 });
subscriptionPlanSchema.index({ isPopular: 1 });
subscriptionPlanSchema.index({ sortOrder: 1 });
subscriptionPlanSchema.index({ "pricing.monthly": 1 });
subscriptionPlanSchema.index({ "pricing.yearly": 1 });

// Virtual for formatted pricing
subscriptionPlanSchema.virtual("formattedPricing").get(function () {
  return {
    monthly: `${this.pricing.currency} ${this.pricing.monthly.toFixed(2)}`,
    yearly: `${this.pricing.currency} ${this.pricing.yearly.toFixed(2)}`,
  };
});

// Virtual for yearly savings percentage
subscriptionPlanSchema.virtual("yearlySavings").get(function () {
  const monthlyTotal = this.pricing.monthly * 12;
  const savings = monthlyTotal - this.pricing.yearly;
  return Math.round((savings / monthlyTotal) * 100);
});

// Virtual for trial period in days
subscriptionPlanSchema.virtual("trialDays").get(function () {
  return this.trialPeriod.enabled ? this.trialPeriod.days : 0;
});

// Pre-save middleware to validate pricing consistency
subscriptionPlanSchema.pre("save", function (next) {
  if (this.pricing.yearly >= this.pricing.monthly * 12) {
    return next(
      new Error("Yearly price should be less than 12 times monthly price")
    );
  }
  next();
});

// Pre-save middleware to validate admin access for creation/updates
subscriptionPlanSchema.pre("save", async function (next) {
  // Only validate admin access if this is a new document or being updated
  if (this.isNew || this.isModified()) {
    const User = require("./user");
    const creator = this.createdBy ? await User.findById(this.createdBy) : null;
    const updater = this.updatedBy ? await User.findById(this.updatedBy) : null;

    // Check if creator is admin (for new plans)
    if (
      this.isNew &&
      creator &&
      !["admin", "superadmin"].includes(creator.role)
    ) {
      return next(new Error("Only admins can create subscription plans"));
    }

    // Check if updater is admin (for updates)
    if (
      this.isModified() &&
      updater &&
      !["admin", "superadmin"].includes(updater.role)
    ) {
      return next(new Error("Only admins can update subscription plans"));
    }
  }
  next();
});

// Static method to find plans by type
subscriptionPlanSchema.statics.findByType = function (planType) {
  return this.find({ planType, isActive: true }).sort({ sortOrder: 1 });
};

// Static method to find popular plans
subscriptionPlanSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isPopular: true, isActive: true })
    .sort({ sortOrder: 1 })
    .limit(limit);
};

// Static method to search plans
subscriptionPlanSchema.statics.searchPlans = function (query, options = {}) {
  const { planType, minPrice, maxPrice, tags } = options;

  let searchQuery = {
    isActive: true,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
    ],
  };

  if (planType) {
    searchQuery.planType = planType;
  }

  if (minPrice || maxPrice) {
    searchQuery["pricing.monthly"] = {};
    if (minPrice) searchQuery["pricing.monthly"].$gte = minPrice;
    if (maxPrice) searchQuery["pricing.monthly"].$lte = maxPrice;
  }

  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  return this.find(searchQuery).sort({ sortOrder: 1, isPopular: -1 });
};

// Static method to create plan (admin only)
subscriptionPlanSchema.statics.createPlan = async function (planData, adminId) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can create subscription plans");
  }

  planData.createdBy = adminId;
  return await this.create(planData);
};

// Static method to update plan (admin only)
subscriptionPlanSchema.statics.updatePlan = async function (
  planId,
  updateData,
  adminId
) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can update subscription plans");
  }

  updateData.updatedBy = adminId;
  return await this.findByIdAndUpdate(planId, updateData, {
    new: true,
    runValidators: true,
  });
};

// Static method to delete plan (admin only)
subscriptionPlanSchema.statics.deletePlan = async function (planId, adminId) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can delete subscription plans");
  }

  // Soft delete by setting isActive to false
  return await this.findByIdAndUpdate(
    planId,
    { isActive: false, updatedBy: adminId },
    { new: true }
  );
};

// Instance method to check if plan is available
subscriptionPlanSchema.methods.isAvailable = function () {
  return this.isActive;
};

// Instance method to get subscription options
subscriptionPlanSchema.methods.getSubscriptionOptions = function () {
  if (!this.isAvailable()) {
    return null;
  }

  return {
    planId: this._id,
    name: this.name,
    description: this.description,
    planType: this.planType,
    pricing: {
      monthly: {
        amount: this.pricing.monthly,
        currency: this.pricing.currency,
        interval: "month",
      },
      yearly: {
        amount: this.pricing.yearly,
        currency: this.pricing.currency,
        interval: "year",
        savings: this.yearlySavings,
      },
    },
    features: this.features,
    limits: this.limits,
    trialPeriod: this.trialPeriod,
    billingCycles: this.billingCycles,
  };
};

// Instance method to validate subscription data
subscriptionPlanSchema.methods.validateSubscription = function (
  subscriptionData
) {
  const { billingCycle, userId } = subscriptionData;

  if (!this.isAvailable()) {
    throw new Error("Plan is not available for subscription");
  }

  if (!this.billingCycles.includes(billingCycle)) {
    throw new Error("Invalid billing cycle for this plan");
  }

  if (!userId) {
    throw new Error("User ID is required for subscription");
  }

  return {
    planId: this._id,
    userId,
    billingCycle,
    amount: this.pricing[billingCycle],
    startDate: new Date(),
    endDate:
      billingCycle === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : billingCycle === "yearly"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days
        : billingCycle === "quarterly"
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for weekly
    status: this.trialPeriod.enabled ? "trial" : "active",
    trialEndsAt: this.trialPeriod.enabled
      ? new Date(Date.now() + this.trialPeriod.days * 24 * 60 * 60 * 1000)
      : null,
  };
};

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
