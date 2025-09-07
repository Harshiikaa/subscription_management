const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "pending", "trial"],
      default: "pending",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBilling: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });

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

// Pre-save middleware to calculate next billing date
subscriptionSchema.pre("save", function (next) {
  if (
    this.isNew ||
    this.isModified("billingCycle") ||
    this.isModified("startDate")
  ) {
    const startDate = new Date(this.startDate);
    const billingInterval = this.billingCycle === "monthly" ? 30 : 365;

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
  }).populate("productId");
};

// Static method to find subscriptions by product
subscriptionSchema.statics.findByProduct = function (productId) {
  return this.find({ productId }).populate("userId");
};

// Static method to find expiring subscriptions
subscriptionSchema.statics.findExpiring = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.find({
    status: "active",
    endDate: { $lte: futureDate, $gt: new Date() },
  }).populate("userId productId");
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

  const billingInterval = this.billingCycle === "monthly" ? 30 : 365;
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
