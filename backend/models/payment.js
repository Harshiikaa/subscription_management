const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // subscribe id
    orderId: {
      type: String,
      required: true,
    }, // pid
    amount: {
      type: Number,
      required: true,
    }, // amt
    currency: {
      type: String,
      default: "NPR",
    },

    esewaRefId: {
      type: String,
    }, // rid
    status: {
      type: String,
      enum: ["pending", "success", "failed", "paid"],
      default: "pending",
    },
    transactionUUID: {
      type: String,
      index: true,
    }, // your sent uuid
    esewaRefId: {
      type: String,
      index: true,
      sparse: true,
    }, // eSewa ref (ref_id/transaction_code)
    rawReturn: Object, // decoded Base64 JSON from return
    statusCheckResponse: Object,
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// Only one PAID record per transactionUUID (idempotency)
paymentSchema.index(
  { transactionUUID: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "paid" } }
);

// Prevent duplicate settlements by final reference
paymentSchema.index({ esewaRefId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Payment", paymentSchema);
