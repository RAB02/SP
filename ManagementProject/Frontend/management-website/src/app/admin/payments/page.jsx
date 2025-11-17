"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPayments() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/payments", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const json = await res.json();
        setData(json);
        console.log("Paymnets data:", json);
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        setError("Session expired or unauthorized");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [router]);

  return(
    <div className="min-h-screen bg-gray-100 p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Payment Managment
            
          </h1>
        </div>
      );
}
