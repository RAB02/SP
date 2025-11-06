"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/UserContext";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const { setAdmin } = useContext(UserContext);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/verify", {
          credentials: "include",
        });

        const data = await res.json();

        if (data.loggedIn) {
          router.replace("/admin/dashboard");
        }
      } catch (err) {
        console.error("Error verifying admin:", err);
      }
    };

    verifyAdmin();
  }, [router]);

  useEffect(() => {
    fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Parsed login response:", data);

      // 🔹 Handle failed login
      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }

      console.log("✅ Admin logged in, cookie stored securely.");

      window.dispatchEvent(new Event("adminChange"));
      setAdmin(true);

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Error during login:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-80"
      >
        <h1 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white p-2 rounded transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
