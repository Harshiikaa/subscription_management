import React from "react";

const PaymentFailure: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen font-poppins">
      <h1 className="text-3xl font-bold text-red-600">Payment Failed ❌</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your transaction could not be verified.
      </p>
      <button
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded"
        onClick={() => {
          window.location.href = "/shoppingBag";
        }}
      >
        Back to Cart
      </button>
    </div>
  );
};

export default PaymentFailure;
