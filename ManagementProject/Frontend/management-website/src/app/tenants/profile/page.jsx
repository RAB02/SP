"use client";
import React, { useContext } from "react";
import { UserContext } from "@/components/UserContext";
import RecentlyViewed from "@/components/RecentlyViewed";
import RentingTab from "@/components/RentingTab";

export default function TenantProfile() {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src="https://i.pinimg.com/736x/7d/2e/59/7d2e594b9e08ab2fba15ece12d239457.jpg"
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
              />
            </div>
            
            {/* Profile Header Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user ? user.username || "User" : "Your Profile"}
              </h1>
              {user && (
                <p className="text-gray-600">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Tenant Information</h2>
              {user ? (
                <div className="space-y-1 text-gray-800">
                  <p><span className="font-medium">Name:</span> {user.username}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  {/* <p><span className="font-medium">Phone:</span> {user.phone}</p> */}
                  {/* <p className="text-sm text-gray-600">ID: {user.id}</p> */}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  You are not logged in.{" "}
                  <a href="/tenants/login" className="text-indigo-600 hover:underline">Log in</a>
                </div>
              )}
            </div>

            <RentingTab />
            <RecentlyViewed />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Menu</h2>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="/apply" className="text-indigo-600 hover:underline">Start a new application</a>
                </li>
                <li>
                  <a href="/apply/status" className="text-indigo-600 hover:underline">View application status</a>
                </li>
                <li>
                  <a href="/rentals" className="text-indigo-600 hover:underline">Browse rentals</a>
                </li>
                <li>
                  <a href="/contact" className="text-indigo-600 hover:underline">Contact management</a>
                </li>
                <li>
                  <a href="/tenants/maintenance" className="text-indigo-600 hover:underline">Submit maintenance request</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



