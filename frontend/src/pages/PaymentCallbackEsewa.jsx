import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { paymentService } from "../services/paymentService";

const useQueryString = () => new URLSearchParams(useLocation().search);

const PaymentCallbackEsewa = () => {
  const query = useQueryString();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const raw = window.location.search.replace(/^\?/, "");
      try {
        const { data } = await paymentService.verifyEsewa(raw);
        if (data?.success) {
          setStatus("success");
          setMessage("Payment successful. Your subscription is active.");
        } else {
          setStatus("failed");
          setMessage(data?.message || "Payment verification failed.");
        }
      } catch (e) {
        setStatus("failed");
        setMessage("Payment verification failed.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">eSewa Payment</h1>
          <p className="mt-4 text-gray-700">{status === "verifying" ? "Verifying your payment..." : message}</p>
          <div className="mt-6">
            <Link className="text-indigo-600 hover:underline" to="/dashboard">Go to Dashboard</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCallbackEsewa;
