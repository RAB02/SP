"use client";
import React from "react";

import SignUp from "@/components/SignUp";

export default function signin() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-100 pb-12">
      <div className="flex flex-col mt-10 text-center">
        <b className="text-3xl text-blue-900">Create Account</b>
        <p className="text-base text-blue-950">
          Fill in your details to sign up
        </p>
      </div>
      <div>
        <SignUp />
      </div>
    </div>
  );
}
