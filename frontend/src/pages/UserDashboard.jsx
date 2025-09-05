import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import BillingHistory from "../components/BillingHistory";
import { SkeletonTable } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import { subscriptionService } from "../services/subscriptionService";
import { useEffect, useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useMeta from "../hooks/useMeta";
import { trackEvent } from "../hooks/useAnalytics";

const UserDashboard = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  useDocumentTitle("SaaS - Dashboard");
  useMeta({ description: "View and manage your subscription and billing history." });

  useEffect(() => {
    (async () => {
      try {
        const [subRes, histRes] = await Promise.all([
          subscriptionService.getMySubscription(),
          subscriptionService.billingHistory(),
        ]);
        setStatus(subRes?.data?.data || null);
        setHistory(histRes?.data?.data || []);
      } catch (_) {
        setStatus(null);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doAction = async (fn, successMsg, event) => {
    try {
      if (event) trackEvent({ type: event, ts: Date.now(), planId: event.planId });
      await fn();
      addToast(successMsg, { type: "success" });
      window.location.reload();
    } catch {
      addToast("Action failed. Please try again.", { type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold">Your subscription</h2>

          {loading ? (
            <div className="mt-6"><SkeletonTable rows={4} /></div>
          ) : !status ? (
            <p className="mt-4 text-gray-600">No active subscription. Visit Pricing to choose a plan.</p>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Plan: {status.planName}</div>
                <div className="text-sm text-gray-600">Status: {status.status}</div>
                <div className="text-sm text-gray-600">Renews: {status.renewsOn || "-"}</div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => doAction(() => subscriptionService.upgrade("pro"), "Upgraded successfully", { type: "upgrade", planId: "pro" })}>Upgrade</Button>
                <Button variant="secondary" onClick={() => doAction(() => subscriptionService.downgrade("free"), "Downgraded successfully", { type: "downgrade", planId: "free" })}>Downgrade</Button>
                <Button variant="danger" onClick={() => doAction(() => subscriptionService.cancel(), "Cancelled successfully", { type: "cancel" })}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-lg font-semibold">Billing history</h3>
            <div className="mt-3">
              {loading ? <SkeletonTable rows={3} /> : <BillingHistory items={history} />}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
