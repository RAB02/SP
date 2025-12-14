"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RentingTab() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchLeases = async () => {
      try {
        const res = await fetch("http://localhost:8080/tenants/profile", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (!isMounted) return;

        setItems(data.leases || []);
      } catch (err) {
        if (!isMounted) return;

        console.error("Failed loading leases:", err);
        setError("Could not load rentals");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeases();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );

  if (items.length === 0)
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-gray-500">No active leases found.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
      <ul className="space-y-3">
        {items.slice(0, 6).map((item) => (
          <li key={item.lease_id} className="flex items-center gap-3">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={
                  item.img?.trim()
                    ? item.img
                    : "https://via.placeholder.com/64?text=No+Image"
                }
                alt={item.apartment}
                className="w-16 h-16 rounded object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/64?text=No+Image";
                }}
              />
            </div>

            {/* Text info */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium block truncate">
                {item.apartment}
              </p>

              <div className="text-xs text-gray-600 mt-1">
                {item.bed} bed • {item.bath} bath • ${item.pricing}
              </div>
            </div>

            {/* View Button */}
            <Link
              href={`/tenants/payments/${item.lease_id}`}
              className="text-sm text-blue-600 hover:underline flex-shrink-0"
            >
              Pay Rent
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
