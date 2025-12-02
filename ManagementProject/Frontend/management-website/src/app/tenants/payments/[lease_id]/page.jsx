"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function UserPayment() {
  const { lease_id } = useParams();

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    email: "",
    apartment: "",
    amount: "",
    payment_date: today,
    card_number: "",
    card_name: "",
    cvv: "",
    method: "Card",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // 🔹 Auto-load lease/user/apartment info
  useEffect(() => {
    const fetchLeaseInfo = async () => {
      try {
        setError("");

        const res = await fetch(
          `http://localhost:8080/tenants/payments/${lease_id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load lease info");
        }

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          apartment: data.apartment || "",
          address: data.address || "",
          amount: data.rent_amount != null ? String(data.rent_amount) : prev.amount,
          payment_date: today, 
        }));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load lease info");
      } finally {
        setInfoLoading(false);
      }
    };

    if (lease_id) {
      fetchLeaseInfo();
    }
  }, [lease_id, today]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPaymentInfo(null);

    try {
      const payload = {
        lease_id: Number(lease_id),
        amount: Number(form.amount),
        // enforce today's date on the backend payload, not from the input
        payment_date: new Date().toISOString().slice(0, 10),
        method: form.method,
        status: "Paid",
      };

      const res = await fetch("http://localhost:8080/tenants/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Payment failed");
      }

      // make sure backend returns `payment` if you want this:
      setPaymentInfo(data.payment || null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error sending payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        {infoLoading ? (
          <p className="text-sm text-gray-600">Loading lease info...</p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="w-full bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-8"
            >
              <h1 className="text-2xl font-semibold text-gray-800">
                Make a Payment
              </h1>

              {/* Basic Info Section */}
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-600 m-2">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    readOnly
                    className="input-box bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-600 m-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    readOnly
                    className="input-box bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-600 m-2">Apartment</label>
                  <input
                    name="apartment"
                    value={form.address}
                    readOnly
                    className="input-box bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-gray-600 m-2">Payment Date</label>
                  <input
                    type="date"
                    name="payment_date"
                    value={today}
                    readOnly
                    className="input-box bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium text-gray-600 m-2">Amount</label>
                <input
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  className="input-box"
                  placeholder="1200"
                />
              </div>

              {/* TODO: Card inputs / payment method */}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </form>

            {paymentInfo && (
              <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-emerald-700 mb-3">
                  Payment Submitted
                </h2>
                <p className="text-sm text-gray-600">
                  Payment ID: <span className="font-medium">{paymentInfo.id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Name: <span className="font-medium">{paymentInfo.name}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Tenant Email:{" "}
                  <span className="font-medium">{paymentInfo.tenantName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Apartment:{" "}
                  <span className="font-medium">{paymentInfo.apartment}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Amount:{" "}
                  <span className="font-medium">
                    ${Number(paymentInfo.amount).toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Date: <span className="font-medium">{paymentInfo.date}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Method: <span className="font-medium">{paymentInfo.method}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="font-medium capitalize">
                    {paymentInfo.status}
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}