const mongoose = require("mongoose");
const {
  PRODUCT_CATEGORIES,
  PRODUCT_AVAILABILITY,
} = require("../constants/enums");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: PRODUCT_CATEGORIES,
    },
    price: {
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
    },
    features: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    isPopular: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      enum: PRODUCT_AVAILABILITY,
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trialDays: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxUsers: {
      type: Number,
      min: 1,
      default: null,
    },
    storage: {
      type: String,
      trim: true,
      default: null,
    },
    support: {
      type: String,
      trim: true,
      default: null,
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

// Index for better query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isPopular: 1 });
productSchema.index({ "price.monthly": 1 });
productSchema.index({ "price.yearly": 1 });

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return {
    monthly: `$${this.price.monthly.toFixed(2)}`,
    yearly: `$${this.price.yearly.toFixed(2)}`,
  };
});

// Virtual for savings percentage
productSchema.virtual("yearlySavings").get(function () {
  const monthlyTotal = this.price.monthly * 12;
  const savings = monthlyTotal - this.price.yearly;
  return Math.round((savings / monthlyTotal) * 100);
});

// Pre-save middleware to validate price consistency
productSchema.pre("save", function (next) {
  if (this.price.yearly >= this.price.monthly * 12) {
    return next(
      new Error("Yearly price should be less than 12 times monthly price")
    );
  }
  next();
});

// Pre-save middleware to validate admin access for creation/updates
productSchema.pre("save", async function (next) {
  // Only validate admin access if this is a new document or being updated
  if (this.isNew || this.isModified()) {
    const User = require("./user");
    const creator = this.createdBy ? await User.findById(this.createdBy) : null;
    const updater = this.updatedBy ? await User.findById(this.updatedBy) : null;

    // Check if creator is admin (for new products)
    if (
      this.isNew &&
      creator &&
      !["admin", "superadmin"].includes(creator.role)
    ) {
      return next(new Error("Only admins can create products"));
    }

    // Check if updater is admin (for updates)
    if (
      this.isModified() &&
      updater &&
      !["admin", "superadmin"].includes(updater.role)
    ) {
      return next(new Error("Only admins can update products"));
    }
  }
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({
    isPopular: -1,
    rating: -1,
  });
};

// Static method to find popular products
productSchema.statics.findPopular = function (limit = 10) {
  return this.find({ isPopular: true, isActive: true })
    .sort({ rating: -1, reviews: -1 })
    .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function (query, options = {}) {
  const { category, minPrice, maxPrice, tags } = options;

  let searchQuery = {
    isActive: true,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
    ],
  };

  if (category) {
    searchQuery.category = category;
  }

  if (minPrice || maxPrice) {
    searchQuery["price.monthly"] = {};
    if (minPrice) searchQuery["price.monthly"].$gte = minPrice;
    if (maxPrice) searchQuery["price.monthly"].$lte = maxPrice;
  }

  if (tags && tags.length > 0) {
    searchQuery.tags = { $in: tags };
  }

  return this.find(searchQuery).sort({ isPopular: -1, rating: -1 });
};

// Static method to create product (admin only)
productSchema.statics.createProduct = async function (productData, adminId) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can create products");
  }

  productData.createdBy = adminId;
  return await this.create(productData);
};

// Static method to update product (admin only)
productSchema.statics.updateProduct = async function (
  productId,
  updateData,
  adminId
) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can update products");
  }

  updateData.updatedBy = adminId;
  return await this.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });
};

// Static method to delete product (admin only)
productSchema.statics.deleteProduct = async function (productId, adminId) {
  const User = require("./user");
  const admin = await User.findById(adminId);

  if (!admin || !["admin", "superadmin"].includes(admin.role)) {
    throw new Error("Only admins can delete products");
  }

  // Soft delete by setting isActive to false
  return await this.findByIdAndUpdate(
    productId,
    { isActive: false, updatedBy: adminId },
    { new: true }
  );
};

// Instance method to check if product can be subscribed to
productSchema.methods.canSubscribe = function () {
  return this.isActive && this.availability === "Available";
};

// Instance method to get subscription options
productSchema.methods.getSubscriptionOptions = function () {
  if (!this.canSubscribe()) {
    return null;
  }

  return {
    productId: this._id,
    name: this.name,
    description: this.description,
    pricing: {
      monthly: {
        amount: this.price.monthly,
        currency: "USD",
        interval: "month",
      },
      yearly: {
        amount: this.price.yearly,
        currency: "USD",
        interval: "year",
        savings: this.yearlySavings,
      },
    },
    features: this.features,
    trialDays: this.trialDays,
    maxUsers: this.maxUsers,
    storage: this.storage,
    support: this.support,
  };
};

// Instance method to validate subscription data
productSchema.methods.validateSubscription = function (subscriptionData) {
  const { billingCycle, userId } = subscriptionData;

  if (!this.canSubscribe()) {
    throw new Error("Product is not available for subscription");
  }

  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new Error("Invalid billing cycle");
  }

  if (!userId) {
    throw new Error("User ID is required for subscription");
  }

  return {
    productId: this._id,
    userId,
    billingCycle,
    amount: this.price[billingCycle],
    startDate: new Date(),
    endDate:
      billingCycle === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
    status: "active",
    trialEndsAt:
      this.trialDays > 0
        ? new Date(Date.now() + this.trialDays * 24 * 60 * 60 * 1000)
        : null,
  };
};

module.exports = mongoose.model("Product", productSchema);
