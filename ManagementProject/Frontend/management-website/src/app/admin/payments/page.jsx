"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    user_id: "",
    lease_id: "",
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "Card",
    status: "Paid",
  });

  const fetchTenantsAndLeases = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:8080/admin/payments", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unauthorized");

      const json = await res.json();

      const leasesFromApi = json.leases || [];

      // Store leases (already filtered to active by backend)
      setLeases(leasesFromApi);
      console.log("Leases set:", leasesFromApi);

      // Build a unique tenant list from the leases
      const tenantMap = new Map();
      for (const l of leasesFromApi) {
        if (!tenantMap.has(l.user_id)) {
          tenantMap.set(l.user_id, {
            id: l.user_id,
            email: l.email,
            apartment: l.address, // last known address
          });
        }
      }

      setTenants(Array.from(tenantMap.values()));

      setPayments(json.payments || []);
    } catch (err) {
      console.error("Error loading payments page:", err);
      setError("Session expired or unauthorized");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantsAndLeases();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
        const updated = { ...prev, [name]: value };

        // If they picked a lease, auto-fill the amount using rent_amount
        if (name === "lease_id") {
          const lease = leases.find(
            (l) => l.lease_id === Number(value)
          );
          if (lease) {
            updated.amount = lease.rent_amount;
          }
        }

        return updated;
      });
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    // ✅ match the actual form field names
    if (!form.user_id || !form.lease_id || !form.amount) {
      alert("Please fill in tenant, lease, and amount.");
      return;
    }

    try {
      setError("");

      const res = await fetch("http://localhost:8080/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (data.payment) {
        // add new payment to the top of the table
        setPayments((prev) => [data.payment, ...prev]);
      }

      // reset amount, keep tenant + lease + date/method/status
      setForm((prev) => ({
        ...prev,
        amount: "",
      }));
    }catch (err) {
      console.error("Error saving payment:", err);
      setError(err.message || "Failed to save payment.");
    }
  };

  // For now, payments is empty; we'll hook it later.
  const filteredPayments =
    statusFilter === "all"
      ? payments
      : payments.filter((p) => p.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Payments
            </h1>
            <p className="text-sm text-slate-500">
              Manage tenant payments, record new transactions, and keep track of overdue balances.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          {/* New Payment Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Record Payment
            </h2>
            {loading ? (
              <p className="text-sm text-slate-500">Loading leases…</p>
            ) : (
              <form className="space-y-4" onSubmit={handleAddPayment}>
                {/* Tenant */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Tenant
                  </label>
                  <select
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="">Select tenant</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.email}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Lease */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Lease
                  </label>
                  <select
                    name="lease_id"
                    value={form.lease_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="">Select lease</option>
                    {leases
                      .filter(
                        (l) =>
                          !form.user_id ||
                          l.user_id === Number(form.user_id)
                      )
                      .map((l) => (
                        <option key={l.lease_id} value={l.lease_id}>
                          {l.address}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Amount & Date */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                      placeholder="1200"
                      min="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      value={form.payment_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Method & Status */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Method
                    </label>
                    <select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    >
                      <option>Card</option>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Check</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    >
                      <option>Paid</option>
                      <option>Pending</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  Save Payment
                </button>
              </form>
            )}
          </div>

          {/* Payments Table (will show real payments once you add them) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Payments
              </h2>

              <div className="flex gap-2">
                {["all", "Paid", "Pending", "Overdue"].map((status) => {
                  const isActive = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={[
                        "px-3 py-1.5 rounded-full text-xs font-medium border",
                        isActive
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      {status === "all" ? "All" : status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Tenant
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Apartment
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Lease
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Method
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-2 font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}

                  {filteredPayments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2 text-slate-900">
                        {p.tenantName}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.apartment}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.leaseLabel}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.date}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.method}
                      </td>
                      <td className="px-4 py-2 text-slate-900">
                        ${Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            p.status === "Paid" &&
                              "bg-emerald-50 text-emerald-700",
                            p.status === "Pending" &&
                              "bg-amber-50 text-amber-700",
                            p.status === "Overdue" &&
                              "bg-rose-50 text-rose-700",
                          ].join(" ")}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}