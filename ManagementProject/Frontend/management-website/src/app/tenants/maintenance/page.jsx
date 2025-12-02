"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/UserContext";

export default function MaintenanceRequest() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commonIssues = [
    "HVAC problems (heating/cooling)",
    "Electrical problems",
    "Light bulb out",
    "Plumbing issues (leaks, clogs)",
    "Appliance malfunction",
    "Door/window issues",
    "Lock/key problems",
    "Pest control",
    "Water damage",
    "Smoke detector issues",
    "Internet/WiFi problems",
    "Parking issues",
  ];

  const handleCheckboxChange = (issue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((item) => item !== issue)
        : [...prev, issue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate that at least one issue is selected
    if (selectedIssues.length === 0) {
      setError("Please select at least one maintenance issue");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/maintenance/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
            selectedIssues,
            additionalDetails,
          }),
      });

      // Parse response (whether success or error)
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response isn't JSON, create a basic error object
        data = {};
      }

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = data.error || "Failed to submit maintenance request";
        
        // Handle specific error cases
        if (response.status === 401) {
          errorMessage = "You are not logged in. Please log in and try again.";
          // Clear user context and refresh auth status
          setUser(null);
          window.dispatchEvent(new Event("userChange"));
        } else if (response.status === 400) {
          errorMessage = data.error || "Invalid request. Please check your input and try again.";
        } else if (!data.error) {
          errorMessage = `Server error (${response.status}). Please try again later.`;
        }
        
        throw new Error(errorMessage);
      }

      // Success
      setSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setSelectedIssues([]);
        setAdditionalDetails("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting maintenance request:", err);
      setError(err.message || "Failed to submit maintenance request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to submit a maintenance request.
          </p>
          <a
            href="/tenants/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Maintenance Request
            </h1>
            <p className="text-gray-600">
              Select the issues you're experiencing and provide additional
              details below.
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                Request Submitted Successfully!
              </h3>
              <p className="text-green-700">
                Your maintenance request has been received. We'll contact you
                soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-2">{error}</p>
                  {error.includes("not logged in") && (
                    <a
                      href="/tenants/login"
                      className="text-sm text-indigo-600 hover:underline font-medium"
                    >
                      Go to Login →
                    </a>
                  )}
                </div>
              )}
              {/* Common Issues Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Common Issues
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonIssues.map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue)}
                        onChange={() => handleCheckboxChange(issue)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {issue}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details Section */}
              <div>
                <label
                  htmlFor="additional-details"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Details
                </label>
                <textarea
                  id="additional-details"
                  name="additional-details"
                  rows={6}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Please provide any additional information about the maintenance issue(s), including location, urgency, or other relevant details..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

