const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/errors");
const {
  createProductService,
  updateProductService,
  deleteProductService,
  getProductService,
  listProductsService,
  getSubscriptionOptionsService,
  seedMockProductsService,
} = require("../services/productService");

exports.createProduct = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const product = await createProductService(adminId, req.body);
    return sendSuccess(res, product, "Product created", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const product = await updateProductService(
      adminId,
      req.params.productId,
      req.body
    );
    return sendSuccess(res, product, "Product updated");
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const product = await deleteProductService(adminId, req.params.productId);
    return sendSuccess(res, product, "Product deleted");
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await getProductService(req.params.productId);
    return sendSuccess(res, product, "Product fetched");
  } catch (error) {
    next(error);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const data = await listProductsService({
      search: req.query.search,
      category: req.query.category,
      isPopular:
        req.query.isPopular === "true"
          ? true
          : req.query.isPopular === "false"
          ? false
          : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    });
    return sendSuccess(res, data, "Products fetched");
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptionOptions = async (req, res, next) => {
  try {
    const data = await getSubscriptionOptionsService(req.params.productId);
    return sendSuccess(res, data, "Subscription options fetched");
  } catch (error) {
    next(error);
  }
};

exports.seedMockProducts = async (req, res, next) => {
  try {
    const items = await seedMockProductsService();
    return sendSuccess(res, items, "Mock products seeded");
  } catch (error) {
    next(error);
  }
};
