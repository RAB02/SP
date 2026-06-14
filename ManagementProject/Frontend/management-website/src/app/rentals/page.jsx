"use client";

import RentalCard from "@/components/RentalCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async (filters = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from("Apartments")
        .select("*, ApartmentImages(image_url)")
        .eq("is_occupied", 0);


      if (filters.minPrice) {
        query = query.gte("pricing", filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte("pricing", filters.maxPrice);
      }

      if (filters.minBeds) {
        query = query.gte("bed", filters.minBeds);
      }

      if (filters.minBaths) {
        query = query.gte("bath", filters.minBaths);
      }

      if (filters.petsAllowed) {
        query = query.eq("pets_allowed", true);
      }

      const { data, error } = await query;

    if (error) throw error;

    setRentals(data || []);
  } catch (err) {
    console.error("Error:", err.message);

    // 🔥 Retry once after delay (wake-up time)
    if (retry) {
      console.log("Retrying after wake-up...");
      setTimeout(() => fetchRentals(filters, false), 2000);
    } else {
      setErrorMessage("Server waking up... please wait a moment.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleFilter = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      (minPrice && minPrice < 0) ||
      (maxPrice && maxPrice < 0) ||
      (minBeds && minBeds < 0) ||
      (minBaths && minBaths < 0)
    ) {
      return setErrorMessage("Values cannot be negative.");
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return setErrorMessage("Min price cannot be greater than max price.");
    }

    if (minBeds && !Number.isInteger(Number(minBeds))) {
      return setErrorMessage("Beds must be a whole number.");
    }

    if (minBaths && !Number.isInteger(Number(minBaths))) {
      return setErrorMessage("Baths must be a whole number.");
    }

    fetchRentals({
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      petsAllowed,
    });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setPetsAllowed(false);
    setErrorMessage("");
    fetchRentals();
  };

  return (
    <>
      {errorMessage && (
        <div className="text-red-600 font-semibold mb-4">{errorMessage}</div>
      )}

      <form
        onSubmit={handleFilter}
        className="flex justify-center bg-gray-100 p-4 rounded-lg mb-6 gap-3 flex-wrap"
      >
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded w-32"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded w-32"
        />
        <input
          type="number"
          placeholder="Min Beds"
          value={minBeds}
          onChange={(e) => setMinBeds(e.target.value)}
          className="p-2 border rounded w-32"
        />
        <input
          type="number"
          placeholder="Min Baths"
          value={minBaths}
          onChange={(e) => setMinBaths(e.target.value)}
          className="p-2 border rounded w-32"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={petsAllowed}
            onChange={(e) => setPetsAllowed(e.target.checked)}
          />
          Pets Allowed
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Filter
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </form>

      {loading ? (
        <p className="text-center">Loading rentals...</p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="container mx-auto flex justify-evenly flex-wrap gap-4"
        >
          {rentals.map((rental) => (
            <motion.div key={rental.apartment_id} variants={cardVariants}>
              <RentalCard rental={rental} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}