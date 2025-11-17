"use client";
import React from "react";

import LogIn from "@/components/LogIn";

export default function signin() {
  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-100 pb-12">
      <div className="flex flex-col mt-10 text-center">
        <b className="text-3xl text-blue-900">Log in</b>
        <p className="text-base text-blue-950">Login Using Your Credentials</p>
      </div>

      <div>
        <LogIn />
      </div>
    </div>
  );
}
