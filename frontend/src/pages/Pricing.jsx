import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PlanCard from "../components/PlanCard";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { subscriptionService } from "../services/subscriptionService";
import { paymentService } from "../services/paymentService";
import { useEffect, useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useMeta from "../hooks/useMeta";
import { trackEvent } from "../hooks/useAnalytics";

const defaultPlans = [
  { id: "free", name: "Free", price: "NPR 0", features: ["Basic features", "Email support"] },
  { id: "pro", name: "Pro", price: "NPR 999/mo", features: ["Advanced features", "Priority support", "Higher limits"], badge: "Most Popular", highlight: true },
  { id: "enterprise", name: "Enterprise", price: "Contact us", features: ["Custom features", "Dedicated support"] },
];

const Pricing = () => {
  useDocumentTitle("SaaS - Pricing");
  useMeta({ description: "Transparent pricing for Free, Pro, and Enterprise plans." });
  const [plans, setPlans] = useState(defaultPlans);
  const [gateway, setGateway] = useState("esewa"); // "esewa" | "imepay"
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await subscriptionService.listPlans();
        if (data?.data) setPlans(data.data);
      } catch (_) {}
      finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSelectPlan = async (plan) => {
    try {
      trackEvent({ type: "subscribe_click", planId: plan.id, gateway, ts: Date.now() });
      await subscriptionService.subscribe(plan.id, gateway);
      addToast(`Redirecting to ${gateway === "esewa" ? "eSewa" : "IME Pay"}...`, { type: "success" });
      if (gateway === "esewa") {
        const { data } = await paymentService.initiateEsewa({ planId: plan.id });
        if (data?.action && data?.params) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.action;
          Object.entries(data.params).forEach(([k, v]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        } else if (data?.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } else if (gateway === "imepay") {
        const { data } = await paymentService.initiateImePay({ planId: plan.id });
        if (data?.redirectUrl) window.location.href = data.redirectUrl;
      }
    } catch (e) {
      addToast("Payment initiation failed. Please try again.", { type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Choose your plan</h2>
            <div className="flex items-center gap-3 text-sm">
              <label className="text-gray-600">Gateway:</label>
              <select
                className="rounded-md border border-gray-300 px-3 py-2"
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
              >
                <option value="esewa">eSewa</option>
                <option value="imepay">IME Pay</option>
              </select>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : plans.map((p) => (
                  <PlanCard
                    key={p.id}
                    name={p.name}
                    price={p.price}
                    features={p.features}
                    badge={p.badge}
                    highlight={p.highlight}
                    onSelect={() => onSelectPlan(p)}
                  />
                ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
