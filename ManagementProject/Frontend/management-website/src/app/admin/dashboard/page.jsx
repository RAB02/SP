"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/dashboard", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Unauthorized");

      const json = await res.json();
      setData(json);
      console.log("Dashboard data:", json);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Session expired or unauthorized");
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [router]);

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => router.push("/admin/login")}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );

  if (!data)
    return (
      <p className="p-4 text-gray-600">
        No data available. Try refreshing the page.
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage apartment and tenants
          </p>
        </div>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Occupied Units"
          value={data.occupied || 0}
          color="text-amber-600"
          icon="📦"
        />
        <StatCard
          label="Vacant Units"
          value={data.vacant || 0}
          color="text-gray-600"
          icon="🪟"
        />
        <StatCard
          label="Total Apartments"
          value={data.apartmentCount}
          color="text-blue-700"
          icon="🏠"
        />
        <StatCard
          label="Total Users"
          value={data.userCount}
          color="text-green-700"
          icon="👤"
        />
      </section>

      {/* Admin Info */}
      {data.adminEmail && (
        <div className="mt-10 text-gray-600 text-sm">
          <p>
            Logged in as{" "}
            <span className="font-semibold text-gray-800">
              {data.adminEmail}
            </span>
          </p>
        </div>
      )}

      {/* Placeholder for tenants/apartments table */}
      <section className="mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Apartments
          </h2>

          {!data.apartments || data.apartments.length === 0 ? (
            <p className="text-gray-500 text-sm">No apartments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-gray-600 border-b">
                  <tr>
                    <th className="py-2 pr-4">Complex</th>
                    <th className="py-2 pr-4">Address</th>
                    <th className="py-2 pr-4">Beds</th>
                    <th className="py-2 pr-4">Baths</th>
                    <th className="py-2 pr-4">Rent</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.apartments.map((apt) => (
                    <tr
                      key={apt.apartment_id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-2 pr-4 font-medium text-gray-800">
                        {apt.apartment_name || "—"}
                      </td>
                      <td className="py-2 pr-4 font-medium text-gray-800">
                        {apt.address || "—"}
                      </td>
                      <td className="py-2 pr-4">{apt.bed}</td>
                      <td className="py-2 pr-4">{apt.bath}</td>
                      <td className="py-2 pr-4 text-blue-700 font-semibold">
                        ${apt.pricing}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            // Have to add this to the database still
                            apt.is_occupied
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {apt.is_occupied ? "Occupied" : "Vacant"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
