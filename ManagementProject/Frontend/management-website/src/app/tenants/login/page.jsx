"use client";
import React from "react";
import LogIn from "@/components/LogIn";

export default function TenantsLogin() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-100 pb-12">
      <div className="flex flex-col mt-10 text-center">
        <b className="text-3xl text-blue-900">Tenant Login</b>
        <p className="text-base text-blue-950">
          Log in to view applications, leases, and rentals
        </p>
      </div>

      <div>
        <LogIn />
      </div>

      <div className="mt-6 text-center text-sm text-gray-700">
        <p className="mb-1">
          New here?{" "}
          <a href="/signin" className="text-indigo-600 hover:underline">
            Create an account
          </a>
        </p>
        <p>
          Prospective tenant?{" "}
          <a href="/apply" className="text-indigo-600 hover:underline">
            Start your application
          </a>
        </p>
      </div>
    </div>
  );
}


