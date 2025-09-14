const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Either productId or subscriptionPlanId must be provided, but not both
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false,
    },
    // Subscription type to distinguish between product and plan subscriptions
    subscriptionType: {
      type: String,
      enum: ["product", "plan"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending", "trial"],
      default: "pending",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "quarterly", "weekly"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "NPR"],
      default: "USD",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextBilling: {
      type: Date,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "stripe", "card"],
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    nextPaymentDate: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ productId: 1 });
subscriptionSchema.index({ subscriptionPlanId: 1 });
subscriptionSchema.index({ subscriptionType: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBilling: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, subscriptionType: 1 });

// Virtual for days remaining
subscriptionSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for is active
subscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" && new Date() < new Date(this.endDate);
});

// Virtual for is in trial
subscriptionSchema.virtual("isInTrial").get(function () {
  return (
    this.status === "trial" &&
    this.trialEndsAt &&
    new Date() < new Date(this.trialEndsAt)
  );
});

// Pre-save middleware to validate subscription type and references
subscriptionSchema.pre("save", function (next) {
  // Validate that either productId or subscriptionPlanId is provided, but not both
  if (this.subscriptionType === "product" && !this.productId) {
    return next(new Error("productId is required for product subscriptions"));
  }
  if (this.subscriptionType === "plan" && !this.subscriptionPlanId) {
    return next(
      new Error("subscriptionPlanId is required for plan subscriptions")
    );
  }
  if (this.productId && this.subscriptionPlanId) {
    return next(new Error("Cannot have both productId and subscriptionPlanId"));
  }
  if (!this.productId && !this.subscriptionPlanId) {
    return next(
      new Error("Either productId or subscriptionPlanId must be provided")
    );
  }
  next();
});

// Pre-save middleware to calculate next billing date
subscriptionSchema.pre("save", function (next) {
  if (
    this.isNew ||
    this.isModified("billingCycle") ||
    this.isModified("startDate")
  ) {
    const startDate = new Date(this.startDate);
    let billingInterval;

    switch (this.billingCycle) {
      case "weekly":
        billingInterval = 7;
        break;
      case "monthly":
        billingInterval = 30;
        break;
      case "quarterly":
        billingInterval = 90;
        break;
      case "yearly":
        billingInterval = 365;
        break;
      default:
        billingInterval = 30;
    }

    this.nextBilling = new Date(
      startDate.getTime() + billingInterval * 24 * 60 * 60 * 1000
    );
    this.nextPaymentDate = this.nextBilling;
  }
  next();
});

// Static method to find active subscriptions for a user
subscriptionSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    userId,
    status: { $in: ["active", "trial"] },
    endDate: { $gt: new Date() },
  }).populate("productId subscriptionPlanId");
};

// Static method to find subscriptions by product
subscriptionSchema.statics.findByProduct = function (productId) {
  return this.find({ productId, subscriptionType: "product" }).populate(
    "userId"
  );
};

// Static method to find subscriptions by plan
subscriptionSchema.statics.findByPlan = function (subscriptionPlanId) {
  return this.find({ subscriptionPlanId, subscriptionType: "plan" }).populate(
    "userId"
  );
};

// Static method to find subscriptions by type
subscriptionSchema.statics.findByType = function (subscriptionType) {
  return this.find({ subscriptionType }).populate(
    "userId productId subscriptionPlanId"
  );
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: "active",
    endDate: { $lte: futureDate, $gt: new Date() },
  }).populate("userId productId subscriptionPlanId");
};

// Static method to create subscription from product
subscriptionSchema.statics.createFromProduct = async function (
  productId,
  userId,
  billingCycle,
  paymentMethod
) {
  const Product = require("./product");
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.canSubscribe()) {
    throw new Error("Product is not available for subscription");
  }

  // Check if user already has an active subscription for this product
  const existingSubscription = await this.findOne({
    userId,
    productId,
    subscriptionType: "product",
    status: { $in: ["active", "trial"] },
  });

  if (existingSubscription) {
    throw new Error("User already has an active subscription for this product");
  }

  const subscriptionData = product.validateSubscription({
    billingCycle,
    userId,
  });

  subscriptionData.paymentMethod = paymentMethod;
  subscriptionData.subscriptionType = "product";

  return await this.create(subscriptionData);
};

// Static method to create subscription from plan
subscriptionSchema.statics.createFromPlan = async function (
  subscriptionPlanId,
  userId,
  billingCycle,
  paymentMethod
) {
  const SubscriptionPlan = require("./subscriptionPlan");
  const plan = await SubscriptionPlan.findById(subscriptionPlanId);

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  if (!plan.isAvailable()) {
    throw new Error("Plan is not available for subscription");
  }

  // Check if user already has an active subscription for this plan
  const existingSubscription = await this.findOne({
    userId,
    subscriptionPlanId,
    subscriptionType: "plan",
    status: { $in: ["active", "trial"] },
  });

  if (existingSubscription) {
    throw new Error("User already has an active subscription for this plan");
  }

  const subscriptionData = plan.validateSubscription({
    billingCycle,
    userId,
  });

  subscriptionData.paymentMethod = paymentMethod;
  subscriptionData.subscriptionType = "plan";

  return await this.create(subscriptionData);
};

// Instance method to cancel subscription
subscriptionSchema.methods.cancel = function (reason = null) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.autoRenew = false;
  return this.save();
};

// Instance method to renew subscription
subscriptionSchema.methods.renew = function () {
  if (this.status !== "active") {
    throw new Error("Only active subscriptions can be renewed");
  }

  let billingInterval;
  switch (this.billingCycle) {
    case "weekly":
      billingInterval = 7;
      break;
    case "monthly":
      billingInterval = 30;
      break;
    case "quarterly":
      billingInterval = 90;
      break;
    case "yearly":
      billingInterval = 365;
      break;
    default:
      billingInterval = 30;
  }

  const newEndDate = new Date(
    this.endDate.getTime() + billingInterval * 24 * 60 * 60 * 1000
  );

  this.endDate = newEndDate;
  this.nextBilling = newEndDate;
  this.nextPaymentDate = newEndDate;
  this.lastPaymentDate = new Date();

  return this.save();
};

// Instance method to check if subscription is expiring soon
subscriptionSchema.methods.isExpiringSoon = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return this.endDate <= futureDate && this.endDate > new Date();
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
