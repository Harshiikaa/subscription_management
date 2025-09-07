const Product = require("../models/product");

exports.createProductRepo = async (productData) => {
  return await Product.create(productData);
};

exports.updateProductRepo = async (productId, updateData) => {
  return await Product.findByIdAndUpdate(productId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteProductRepo = async (productId) => {
  return await Product.findByIdAndUpdate(
    productId,
    { isActive: false },
    { new: true }
  );
};

exports.getProductByIdRepo = async (productId) => {
  return await Product.findById(productId);
};

exports.listProductsRepo = async ({
  search = "",
  category,
  isPopular,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  includeInactive = false,
} = {}) => {
  const query = {};

  if (!includeInactive) query.isActive = true;
  if (category) query.category = category;
  if (typeof isPopular === "boolean") query.isPopular = isPopular;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }
  if (minPrice || maxPrice) {
    query["price.monthly"] = {};
    if (minPrice) query["price.monthly"].$gte = minPrice;
    if (maxPrice) query["price.monthly"].$lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort({ isPopular: -1, rating: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
