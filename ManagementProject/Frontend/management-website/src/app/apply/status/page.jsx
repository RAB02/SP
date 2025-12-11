'use client';

import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/components/UserContext";

const statusOrder = ["submitted", "under_review", "approved"];

const statusStyles = {
  submitted: "bg-amber-100 text-amber-800 border-amber-200",
  under_review: "bg-sky-100 text-sky-800 border-sky-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusLabels = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
};

const formatDate = (value) => {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ApplicationStatusPage() {
  const { user, setUser } = useContext(UserContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:8080/applications", {
          credentials: "include",
        });

        if (res.status === 401) {
          setUser(null);
          window.dispatchEvent(new Event("userChange"));
          setError("Please log in to view your applications.");
          return;
        }

        if (!res.ok) throw new Error("Failed to load applications");

        const data = await res.json();
        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, setUser]);

  const summary = useMemo(() => {
    return applications.reduce((acc, app) => {
      // Normalize status: ensure it matches one of the expected status values
      let status = app.status || "submitted";
      if (status.toLowerCase() === "pending") {
        status = "submitted";
      }
      // Map old statuses to new ones
      if (status === "rejected" || status === "leased") {
        status = "approved"; // Map rejected/leased to approved for display
      }
      // Only count if status is in the expected list
      if (statusOrder.includes(status)) {
        acc[status] = (acc[status] || 0) + 1;
        // Submitted applications also count as under_review
        if (status === "submitted") {
          acc["under_review"] = (acc["under_review"] || 0) + 1;
        }
      }
      return acc;
    }, { submitted: 0, under_review: 0, approved: 0 });
  }, [applications]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Login required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to view your apartment applications.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm text-indigo-600 font-semibold">Applications</p>
            <h1 className="text-3xl font-bold text-gray-900">Application Status</h1>
            <p className="text-gray-600 mt-1">
              Track the progress of your apartment applications.
            </p>
          </div>
          <div>
            <a
              href="/apply"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Submit new application
            </a>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statusOrder.map((key) => (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {statusLabels[key]}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary[key] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-600 space-y-3">
              <p className="font-semibold text-gray-900">No applications yet</p>
              <p className="text-sm text-gray-600">
                Start your journey by submitting an application.
              </p>
              <a
                href="/apply"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Submit application
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((app) => {
                // Normalize status for display
                let displayStatus = app.status || "submitted";
                if (displayStatus.toLowerCase() === "pending") {
                  displayStatus = "submitted";
                }
                // Map old statuses to new ones
                if (displayStatus === "rejected" || displayStatus === "leased") {
                  displayStatus = "approved";
                }
                // Ensure status is in statusOrder
                if (!statusOrder.includes(displayStatus)) {
                  displayStatus = "submitted";
                }
                
                const currentStep = statusOrder.indexOf(displayStatus);
                const badge = statusStyles[displayStatus] || statusStyles.submitted;

                return (
                  <li key={app.application_id} className="p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Application #{app.application_id}
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {app.property_name || app.property_address || "Apartment Application"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Applied {formatDate(app.created_at)}
                        </p>
                        {app.unit_number && (
                          <p className="text-sm text-gray-600">Unit {app.unit_number}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
                      >
                        {statusLabels[displayStatus] || "Submitted"}
                      </span>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
                      <div className="flex items-center gap-4">
                        {statusOrder.map((step, index) => {
                          // For submitted status (index 0), show as reached
                          const reached = currentStep >= 0 && index <= currentStep;
                          const isCurrent = index === currentStep;

                          return (
                            <div key={step} className="flex items-center gap-4">
                              <div
                                className={`relative h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                                  reached
                                    ? isCurrent
                                      ? "bg-indigo-600 border-indigo-600 text-white scale-110"
                                      : "bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-gray-100 border-gray-300 text-gray-500"
                                }`}
                              >
                                {reached && !isCurrent && (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {(!reached || isCurrent) && index + 1}
                              </div>

                              {index < statusOrder.length - 1 && (
                                <div
                                  className={`h-0.5 w-16 ${
                                    index < currentStep ? "bg-indigo-600" : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Details */}
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-800 mb-2">Details</p>
                        <div className="space-y-1 text-gray-600">
                          {app.move_in_date && (
                            <p>
                              Desired move-in: {new Date(app.move_in_date).toLocaleDateString()}
                            </p>
                          )}
                          {app.monthly_rent && <p>Rent: ${app.monthly_rent}/mo</p>}
                          {app.applicants && <p>Applicants: {app.applicants}</p>}
                          {app.pets && <p>Pets: {app.pets}</p>}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}