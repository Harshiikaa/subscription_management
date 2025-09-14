import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const transactionId: string | null = params.get("transactionId");
  const message: string | null = params.get("message");
  const navigate = useNavigate();

  useEffect(() => {
    if (!transactionId) {
      // if no transactionId found, go back home or error
      navigate("/");
    }
  }, [transactionId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen font-poppins">
      <h1 className="text-3xl font-bold text-green-600">
        Payment Successful! ✅
      </h1>
      <p className="mt-4 text-lg text-gray-700">{message}</p>
      <p className="mt-2 text-md">
        Transaction ID: <strong>{transactionId}</strong>
      </p>
      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
