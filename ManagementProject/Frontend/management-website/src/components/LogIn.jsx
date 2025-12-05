"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/UserContext";

export default function LogIn() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/verify", {
          credentials: "include",
        });
        const result = await res.json();
        console.log("Parsed verify response:", result);
        if (result.loggedIn) {
          setUser(result.user);
          router.replace("/rentals");
        }
      } catch (err) {
        console.log("No active user session");
      }
    };

    checkUser();
  }, [router, setUser]);

  useEffect(() => {
    // When visiting /login, clear any admin cookie
    fetch("http://localhost:8080/admin/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.email === "" || data.password_hash === "") {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ automatically stores HttpOnly cookie
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Parsed login response:", result);

      if (!res.ok) {
        setError(result.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      if (result.success) {
        setUser(result.user);
        window.dispatchEvent(new Event("userChange"));
        localStorage.removeItem("recentlyViewedRentals");

        router.push("/rentals");
      } else {
        setError(result.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-2/3 min-w-[600px] bg-white border-4 shadow-2xl shadow-inner p-6 rounded-2xl mt-6 md:w-3/4 md:max-w-[500px]">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            value={data.password_hash}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 font-semibold text-white rounded-lg shadow transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
