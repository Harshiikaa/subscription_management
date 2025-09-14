const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to subscription if this is a subscription payment
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    // Reference to product if this is a direct product payment
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    // Payment type to distinguish between subscription and direct payments
    paymentType: {
      type: String,
      enum: ["subscription", "product", "plan"],
      required: true,
    },
    // Order/transaction identifier
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    // Transaction UUID for payment gateway
    transactionUUID: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
    // Payment method used
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "stripe", "card", "bank_transfer"],
      required: true,
    },
    // Payment provider reference ID
    providerRefId: {
      type: String,
      index: true,
      sparse: true,
    },
    // Payment status
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    // Gateway-specific data
    gatewayData: {
      rawReturn: Object, // Raw response from payment gateway
      statusCheckResponse: Object, // Status check response
      signature: String, // Payment signature for verification
    },
    // Payment dates
    paidAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    // Failure reason
    failureReason: {
      type: String,
      default: null,
    },
    // Refund information
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
    },
    // Metadata for additional information
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
paymentSchema.index({ userId: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ productId: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ paidAt: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, paymentType: 1 });

// Only one completed record per transactionUUID (idempotency)
paymentSchema.index(
  { transactionUUID: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "completed" } }
);

// Prevent duplicate settlements by provider reference
paymentSchema.index({ providerRefId: 1 }, { unique: true, sparse: true });

// Virtual for formatted amount
paymentSchema.virtual("formattedAmount").get(function () {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for is completed
paymentSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

// Virtual for is pending
paymentSchema.virtual("isPending").get(function () {
  return this.status === "pending" || this.status === "processing";
});

// Virtual for is failed
paymentSchema.virtual("isFailed").get(function () {
  return this.status === "failed" || this.status === "cancelled";
});

// Pre-save middleware to validate payment type and references
paymentSchema.pre("save", function (next) {
  // Validate that appropriate reference is provided based on payment type
  if (this.paymentType === "subscription" && !this.subscriptionId) {
    return next(
      new Error("subscriptionId is required for subscription payments")
    );
  }
  if (this.paymentType === "product" && !this.productId) {
    return next(new Error("productId is required for product payments"));
  }
  if (this.subscriptionId && this.productId) {
    return next(new Error("Cannot have both subscriptionId and productId"));
  }
  if (!this.subscriptionId && !this.productId) {
    return next(
      new Error("Either subscriptionId or productId must be provided")
    );
  }
  next();
});

// Static method to find payments by user
paymentSchema.statics.findByUser = function (userId, options = {}) {
  const { paymentType, status, limit = 20, page = 1 } = options;
  const query = { userId };

  if (paymentType) query.paymentType = paymentType;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("subscriptionId productId");
};

// Static method to find payments by subscription
paymentSchema.statics.findBySubscription = function (subscriptionId) {
  return this.find({ subscriptionId, paymentType: "subscription" })
    .sort({ createdAt: -1 })
    .populate("subscriptionId");
};

// Static method to find payments by product
paymentSchema.statics.findByProduct = function (productId) {
  return this.find({ productId, paymentType: "product" })
    .sort({ createdAt: -1 })
    .populate("productId");
};

// Static method to find completed payments
paymentSchema.statics.findCompleted = function (options = {}) {
  const { startDate, endDate, limit = 100 } = options;
  const query = { status: "completed" };

  if (startDate || endDate) {
    query.paidAt = {};
    if (startDate) query.paidAt.$gte = new Date(startDate);
    if (endDate) query.paidAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ paidAt: -1 })
    .limit(limit)
    .populate("userId subscriptionId productId");
};

// Instance method to mark payment as completed
paymentSchema.methods.markCompleted = function (providerRefId = null) {
  this.status = "completed";
  this.paidAt = new Date();
  if (providerRefId) this.providerRefId = providerRefId;
  return this.save();
};

// Instance method to mark payment as failed
paymentSchema.methods.markFailed = function (reason = null) {
  this.status = "failed";
  this.failedAt = new Date();
  if (reason) this.failureReason = reason;
  return this.save();
};

// Instance method to process refund
paymentSchema.methods.processRefund = function (amount, reason = null) {
  if (this.status !== "completed") {
    throw new Error("Only completed payments can be refunded");
  }

  this.status = "refunded";
  this.refundedAt = new Date();
  this.refundAmount = amount || this.amount;
  if (reason) this.refundReason = reason;
  return this.save();
};

module.exports = mongoose.model("Payment", paymentSchema);
