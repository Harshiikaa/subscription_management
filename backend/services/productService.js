const AppError = require("../utils/errors");
const Product = require("../models/product");
const {
  createProductRepo,
  updateProductRepo,
  deleteProductRepo,
  getProductByIdRepo,
  listProductsRepo,
} = require("../repositories/productRepo");

// Source of truth mock products (can be loaded from a JSON later)
const MOCK_PRODUCTS = [
  {
    name: "Premium Cloud Storage",
    description:
      "Secure cloud storage solution with advanced encryption and seamless file synchronization across all your devices.",
    image: "https://picsum.photos/seed/cloud-storage/800/600",
    url: "https://example.com/cloud-storage",
    category: "Cloud Services",
    price: { monthly: 12.99, yearly: 129.99 },
    features: [
      "1TB secure cloud storage",
      "End-to-end encryption",
      "Cross-platform sync",
      "File versioning",
      "24/7 customer support",
      "Mobile app access",
    ],
    isPopular: true,
    rating: 4.8,
    reviews: 1247,
    tags: ["Storage", "Security", "Sync"],
    availability: "Available",
  },
  {
    name: "AI-Powered Analytics Dashboard",
    description:
      "Transform your data into actionable insights with our advanced AI analytics platform designed for modern businesses.",
    image: "https://picsum.photos/seed/analytics/800/600",
    url: "https://example.com/analytics",
    category: "Analytics",
    price: { monthly: 29.99, yearly: 299.99 },
    features: [
      "Real-time data visualization",
      "AI-powered insights",
      "Custom dashboard creation",
      "Data export capabilities",
      "Team collaboration tools",
      "API integration",
    ],
    rating: 4.6,
    reviews: 892,
    tags: ["AI", "Analytics", "Dashboard"],
    availability: "Available",
  },
  {
    name: "Professional Email Marketing Suite",
    description:
      "Create, send, and track email campaigns with our comprehensive marketing automation platform.",
    image: "https://picsum.photos/seed/email-marketing/800/600",
    url: "https://example.com/email-marketing",
    category: "Marketing",
    price: { monthly: 19.99, yearly: 199.99 },
    features: [
      "Drag-and-drop email builder",
      "Automated campaign sequences",
      "Advanced segmentation",
      "A/B testing tools",
      "Detailed analytics",
      "CRM integration",
    ],
    rating: 4.7,
    reviews: 2156,
    tags: ["Email", "Marketing", "Automation"],
    availability: "Available",
  },
  {
    name: "Secure VPN Service",
    description:
      "Protect your online privacy and access global content with our high-speed, secure VPN service.",
    image: "https://picsum.photos/seed/vpn-service/800/600",
    url: "https://example.com/vpn",
    category: "Security",
    price: { monthly: 9.99, yearly: 99.99 },
    features: [
      "Unlimited bandwidth",
      "200+ server locations",
      "No-logs policy",
      "Kill switch protection",
      "Multi-device support",
      "24/7 customer support",
    ],
    rating: 4.5,
    reviews: 3421,
    tags: ["VPN", "Privacy", "Security"],
    availability: "Available",
  },
  {
    name: "Project Management Pro",
    description:
      "Streamline your team's workflow with our comprehensive project management and collaboration platform.",
    image: "https://picsum.photos/seed/project-management/800/600",
    url: "https://example.com/project-management",
    category: "Productivity",
    price: { monthly: 24.99, yearly: 249.99 },
    features: [
      "Task and project tracking",
      "Team collaboration tools",
      "Time tracking",
      "Resource management",
      "Custom workflows",
      "Integration with 100+ apps",
    ],
    rating: 4.9,
    reviews: 1876,
    tags: ["Project Management", "Collaboration", "Productivity"],
    availability: "Available",
  },
  {
    name: "Advanced Video Conferencing",
    description:
      "Host professional meetings with crystal-clear video, advanced features, and enterprise-grade security.",
    image: "https://picsum.photos/seed/video-conferencing/800/600",
    url: "https://example.com/video-conferencing",
    category: "Communication",
    price: { monthly: 15.99, yearly: 159.99 },
    features: [
      "HD video and audio",
      "Screen sharing",
      "Recording capabilities",
      "Virtual backgrounds",
      "Breakout rooms",
      "Meeting transcription",
    ],
    rating: 4.4,
    reviews: 963,
    tags: ["Video", "Communication", "Meetings"],
    availability: "Available",
  },
];

exports.seedMockProductsService = async () => {
  for (const mock of MOCK_PRODUCTS) {
    // use URL as an idempotent unique field for upsert
    await Product.updateOne(
      { url: mock.url },
      { $setOnInsert: mock, $set: { isActive: true } },
      { upsert: true }
    );
  }
  // return all active products
  const seeded = await Product.find({ isActive: true }).sort({
    isPopular: -1,
    rating: -1,
  });
  return seeded;
};

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
