"use client";
import { useEffect, useState } from "react";

export default function PayRentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        setError("Unable to start payment.");
      }
    } catch (err) {
      setError("Error creating payment session.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Pay Rent</h1>
      <p className="text-gray-700 mb-6">
        When you continue, you’ll be taken to a secure payment page.
      </p>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={createCheckout}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        disabled={loading}
      >
        {loading ? "Loading..." : "Pay Now"}
      </button>
    </div>
  );
}