"use client";

import React from "react";

export default function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
