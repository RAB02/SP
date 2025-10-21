'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { toast } from 'react-hot-toast'; // optional: animated feedback

export default function LogIn() {
  const router = useRouter();

  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.email === "" || data.password === "") {
      setError("Please fill all the fields");
      return;
    }

    setError("");

    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        
      });

      const result = await res.json();
      console.log("Parsed result " ,result);

      if (result.success) {
        // Save user info for greeting/autofill
        console.log("Redirecting to rentals ")
        localStorage.setItem("user", JSON.stringify(result.user));
        router.push("/rentals");

      } else {
        setError(result.message || "Login failed");
        // toast.error("Invalid credentials");
      }

      setData({ email: "", password: "" });
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-2/3 min-w-[600px] bg-white box-content border-4 shadow-2xl shadow-inner p-6 rounded-2xl mt-6 md:w-3/4 md:max-w-[500px]">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            value={data.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
