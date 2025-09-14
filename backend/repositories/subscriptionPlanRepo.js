const SubscriptionPlan = require("../models/subscriptionPlan");

exports.createSubscriptionPlanRepo = async (planData) => {
  return await SubscriptionPlan.create(planData);
};

exports.updateSubscriptionPlanRepo = async (planId, updateData) => {
  return await SubscriptionPlan.findByIdAndUpdate(planId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteSubscriptionPlanRepo = async (planId) => {
  return await SubscriptionPlan.findByIdAndUpdate(
    planId,
    { isActive: false },
    { new: true }
  );
};

exports.getSubscriptionPlanByIdRepo = async (planId) => {
  return await SubscriptionPlan.findById(planId);
};

exports.getSubscriptionPlanByNameRepo = async (name) => {
  return await SubscriptionPlan.findOne({ name, isActive: true });
};

exports.listSubscriptionPlansRepo = async ({
  search = "",
  planType,
  isPopular,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  includeInactive = false,
  sortBy = "sortOrder",
  sortOrder = 1,
} = {}) => {
  const query = {};

  if (!includeInactive) query.isActive = true;
  if (planType) query.planType = planType;
  if (typeof isPopular === "boolean") query.isPopular = isPopular;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }
  if (minPrice || maxPrice) {
    query["pricing.monthly"] = {};
    if (minPrice) query["pricing.monthly"].$gte = minPrice;
    if (maxPrice) query["pricing.monthly"].$lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder;

  const [items, total] = await Promise.all([
    SubscriptionPlan.find(query).sort(sort).skip(skip).limit(limit),
    SubscriptionPlan.countDocuments(query),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

exports.getPopularPlansRepo = async (limit = 10) => {
  return await SubscriptionPlan.find({ isPopular: true, isActive: true })
    .sort({ sortOrder: 1 })
    .limit(limit);
};

exports.getPlansByTypeRepo = async (planType) => {
  return await SubscriptionPlan.find({ planType, isActive: true }).sort({
    sortOrder: 1,
  });
};

exports.searchPlansRepo = async (query, options = {}) => {
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

  return await SubscriptionPlan.find(searchQuery).sort({
    sortOrder: 1,
    isPopular: -1,
  });
};

exports.getActivePlansRepo = async () => {
  return await SubscriptionPlan.find({ isActive: true }).sort({
    sortOrder: 1,
  });
};

exports.updatePlanSortOrderRepo = async (planId, sortOrder) => {
  return await SubscriptionPlan.findByIdAndUpdate(
    planId,
    { sortOrder },
    { new: true }
  );
};

exports.bulkUpdatePlansRepo = async (updates) => {
  const bulkOps = updates.map(({ planId, updateData }) => ({
    updateOne: {
      filter: { _id: planId },
      update: updateData,
    },
  }));

  return await SubscriptionPlan.bulkWrite(bulkOps);
};
