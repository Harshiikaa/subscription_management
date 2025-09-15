const AppError = require("../utils/errors");
const Product = require("../models/product");
const {
  createProductRepo,
  updateProductRepo,
  deleteProductRepo,
  getProductByIdRepo,
  listProductsRepo,
} = require("../repositories/productRepo");

exports.createProductService = async (adminId, payload) => {
  const product = await Product.createProduct({ ...payload }, adminId);
  return product;
};

exports.updateProductService = async (adminId, productId, payload) => {
  const updated = await Product.updateProduct(
    productId,
    { ...payload },
    adminId
  );
  if (!updated) throw AppError.notFound("Product not found");
  return updated;
};

exports.deleteProductService = async (adminId, productId) => {
  const deleted = await Product.deleteProduct(productId, adminId);
  if (!deleted) throw AppError.notFound("Product not found");
  return deleted;
};

exports.getProductService = async (productId) => {
  const product = await getProductByIdRepo(productId);
  if (!product || !product.isActive)
    throw AppError.notFound("Product not found");
  return product;
};

exports.listProductsService = async (query) => {
  return await listProductsRepo(query);
};

exports.getSubscriptionOptionsService = async (productId) => {
  const product = await getProductByIdRepo(productId);
  if (!product || !product.isActive)
    throw AppError.notFound("Product not found");
  const options = product.getSubscriptionOptions();
  if (!options)
    throw AppError.badRequest("Product not available for subscription");
  return options;
};
