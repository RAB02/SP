"use client";

import { useState } from "react";

export default function AddApartmentPage() {
  const initialForm = {
    apartment_name: "",
    address: "",
    bed: "",
    bath: "",
    pricing: "",
    lat: "",
    lng: "",
  };

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);       // File[]
  const [previews, setPreviews] = useState([]); // blob URLs
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilesChange = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);

    const urls = list.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const fd = new FormData();

      // Append fields exactly as Apartments table expects
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          // store as "1"/"0" so backend can turn into 1/0
          fd.append(key, value ? "1" : "0");
        } else {
          fd.append(key, value);
        }
      });

      // Append images
      files.forEach((file) => {
        fd.append("images", file); // must match upload.array("images")
      });

      const res = await fetch("http://localhost:8080/admin/add-lease", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add apartment.");
      }

      setMessage(data.message || "Apartment created with images.");
      setForm(initialForm);
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setFiles([]);
    setPreviews([]);
    setMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">
            Add New Apartment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new apartment and upload multiple pictures for it.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {message && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Apartment Name
                </label>
                <input
                  type="text"
                  name="apartment_name"
                  value={form.apartment_name}
                  onChange={handleChange}
                  placeholder="Tree Apartments - A101"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Beds
                </label>
                <input
                  type="number"
                  name="bed"
                  value={form.bed}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Baths
                </label>
                <input
                  type="number"
                  name="bath"
                  value={form.bath}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Rent (per month)
                </label>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-500 border border-slate-200">
                    $
                  </span>
                  <input
                    type="number"
                    name="pricing"
                    step="0.01"
                    value={form.pricing}
                    onChange={handleChange}
                    placeholder="1200"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Lat / Lon + status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Latitude
                </label>
                <input
                  type="number"
                  name="lat"
                  step="any"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="26.2034"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-lg font-medium text-slate-700">
                  Longitude
                </label>
                <input
                  type="number"
                  name="lng"
                  step="any"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="-98.2300"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 flex flex-col gap-3">
                <label className="text-lg font-medium text-slate-700">
                  Apartment Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
                />
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {previews.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={src}
                          alt={`Preview ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-400">
                  You can upload several photos at once. They will be stored and
                  linked in the ApartmentImages table.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Add Apartment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}