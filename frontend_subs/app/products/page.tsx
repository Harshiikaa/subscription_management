"use client";

import { MainNav } from "@/components/navigation/main-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ExternalLink, ShoppingCart, Star, Tag, Zap } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Product interface matching backend
interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  category: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  isPopular?: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
  availability?: string;
}

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products`
        );
        const json = await res.json();
        const items = json?.data?.items || json?.data || [];
        setProducts(items);
      } catch (e) {
        console.error("Failed to load products", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading || loadingProducts) {
    return <div>Loading...</div>;
  }

  // const handleSubscribe = (productId: string) => {
  //   router.push(`/checkout?product=${productId}&billing=${billingCycle}`);
  // };
  const handleSubscribe = (productId: string) => {
    router.push(
      `/dashboard/subscriptions?from=products&product=${productId}&billing=${billingCycle}`
    );
  };

  const handleViewProduct = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-balance">
            Our Products & Services
          </h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Discover our range of premium products and services designed to
            enhance your digital experience.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4 bg-muted p-1 rounded-lg">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {products.map((product) => {
            const price = product.price[billingCycle];

            return (
              <Card
                key={product._id}
                className={`relative group hover:shadow-lg transition-shadow ${
                  product.isPopular ? "border-primary shadow-lg" : ""
                }`}
              >
                {product.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-black"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-sm mb-3">
                        {product.description}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating!)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tags */}
                  {product.tags && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Key Features:</p>
                    <ul className="space-y-1">
                      {product.features.slice(0, 4).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <Zap className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {product.features.length > 4 && (
                        <li className="text-xs text-muted-foreground">
                          +{product.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">
                      {product.availability}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant={product.isPopular ? "default" : "outline"}
                    onClick={() => handleSubscribe(product._id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProduct(product.url)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">
                How do I subscribe to a product?
              </h3>
              <p className="text-muted-foreground text-sm">
                Click the "Subscribe" button on any product card to start your
                subscription. You can choose between monthly or yearly billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground text-sm">
                We accept eSewa, Khalti, and major credit cards for your
                convenience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can cancel your subscription at any time with no
                cancellation fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer free trials?</h3>
              <p className="text-muted-foreground text-sm">
                Most of our products come with a free trial period. Check
                individual product details for specific trial information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
