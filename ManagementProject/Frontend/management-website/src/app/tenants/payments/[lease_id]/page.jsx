"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {Elements,} from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function UserPayment() {
  const { lease_id } = useParams();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    amount: "",
    payment_date: today,
    method: "Card",
  });

  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    const fetchLeaseInfo = async () => {
      try {
        setError("");
        setInfoLoading(true);

        const res = await fetch(
          `http://localhost:8080/tenants/payments/${lease_id}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load lease info");

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          amount:
            data.rent_amount != null ? String(data.rent_amount) : prev.amount,
          payment_date: today,
        }));
      } catch (err) {
        setError(err.message || "Failed to load lease info");
      } finally {
        setInfoLoading(false);
      }
    };

    if (lease_id) fetchLeaseInfo();
  }, [lease_id, today]);

  useEffect(() => {
    const createIntent = async () => {
      try {
        setError("");
        setClientSecret("");

        if (!lease_id) return;

        const res = await fetch(
          "http://localhost:8080/stripe/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ lease_id: Number(lease_id) }),
          }
        );

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to create payment intent");

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message || "Stripe init failed");
      }
    };

    if (!infoLoading && lease_id) createIntent();
  }, [lease_id, infoLoading]);

  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  const onPaid = async (stripePaymentIntentId) => {
    const payload = {
      lease_id: Number(lease_id),
      payment_date: new Date().toISOString().slice(0, 10),
      method: "Card",
      stripe_payment_intent_id: stripePaymentIntentId,
    };

    const res = await fetch("http://localhost:8080/tenants/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || data.message || "Payment save failed");

    return data;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl space-y-6">
        {infoLoading ? (
          <p className="text-sm text-gray-600">Loading lease info...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !clientSecret ? (
          <p className="text-sm text-gray-600">Preparing secure payment...</p>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm form={form} lease_id={lease_id} onPaid={onPaid} />
          </Elements>
        )}
      </div>
    </div>
  );
}
