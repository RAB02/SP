"use client";

import { useEffect, useState } from "react";

export default function RentalApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch("http://localhost:8080/admin/applicants", {
          method: "GET",
          credentials: "include", // send cookies / JWT
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load rental applications");
        }

        const data = await res.json();
        // backend sends: { applicants: [...] }
        setApplications(data.applicants || []);
        console.log("Applicants:", data.applicants);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter(
          (app) => (app.status || "").toLowerCase() === statusFilter
        );

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Call backend
      const res = await fetch(
        `http://localhost:8080/admin/applicants/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      // Update local state so UI reflects the change
      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Error updating status");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Rental Applications
            </h1>
            <p className="text-sm text-slate-500">
              Review all applicants who have applied for an apartment.
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">
              Filter by status:
            </label>
            <select
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading applications...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">{error}</div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Employment
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Address / Rent
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Current Landlord
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr
                      key={app.application_id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      {/* Applicant */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">
                          {app.first_name} {app.last_name}
                        </div>

                        <div className="text-xs text-slate-500">
                          DOB:{" "}
                          {new Date(app.date_of_birth).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{app.email}</div>

                        <div className="text-xs text-slate-500">
                          {app.phone}
                        </div>
                      </td>

                      {/* Employment */}
                      <td className="px-4 py-3">
                        <div className="text-slate-900">
                          {app.job_title || "N/A"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {app.employer}
                        </div>
                        <div className="text-xs text-slate-500">
                          Income: ${app.monthly_income}
                        </div>

                        <div className="text-xs text-slate-500">
                          {app.employment_length} yrs employed
                        </div>
                      </td>

                      {/* Rent + Address */}
                      <td className="px-4 py-3">
                        <div className="text-slate-900">
                          {app.address}
                        </div>

                        <div className="text-xs text-slate-500">
                          Rent: ${app.pricing}
                        </div>
                      </td>

                      {/* Landlord */}
                      <td className="px-4 py-3">
                        <div className="text-slate-900">
                          {app.landlord_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {app.landlord_phone}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-medium border",
                            app.status === "approved"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : app.status === "rejected"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-amber-100 text-amber-700 border-amber-200",
                          ].join(" ")}
                          value={(app.status || "pending").toLowerCase()}
                          onChange={(e) =>
                            handleStatusChange(
                              app.application_id,
                              e.target.value
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Submitted */}
                      <td className="px-4 py-3 text-slate-900">
                        {app.created_at
                          ? new Date(app.created_at).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
