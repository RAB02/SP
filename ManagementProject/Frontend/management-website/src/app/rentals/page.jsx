"use client";

import RentalCard from "@/components/RentalCard";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

//Frame Motion

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: i * 0.5,
    },
  }),
};

//Rentals Page Component
export default function Rentals() {
  //  delcare Variables
  const [user, setUser] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBeds, setMinBeds] = useState("");
  const [minBaths, setMinBaths] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  // Filter Handler
  const handleFilter = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Input Validation
    if (
      (minPrice && minPrice < 0) ||
      (maxPrice && maxPrice < 0) ||
      (minBeds && minBeds < 0) ||
      (minBaths && minBaths < 0)
    ) {
      setErrorMessage("Values cannot be negative.");
      return;
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setErrorMessage("Min price cannot be greater than max price.");
      return;
    }

    if (minBeds && !Number.isInteger(Number(minBeds))) {
      setErrorMessage("Beds must be a whole number.");
      return;
    }

    if (minBaths && !Number.isInteger(Number(minBaths))) {
      setErrorMessage("Baths must be a whole number.");
      return;
    }

    // Filter Parameters
    const query = new URLSearchParams({
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(minBeds && { minBeds }),
      ...(minBaths && { minBaths }),
      petsAllowed: petsAllowed.toString(),
    }).toString();

    // Fetch Filtered Rentals
    try {
      const response = await fetch(`http://localhost:8080/rentals?${query}`);
      const data = await response.json();
      setRentals(data || []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to fetch rentals.");
      console.error("Error fetching filtered rentals:", error);
    }
  };

  // Reset Filters Handler
  const handleReset = async () => {
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setPetsAllowed(false);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8080/rentals");
      const data = await response.json();
      console.log(data);
      setRentals(data || []);
    } catch (error) {
      console.error("Error resetting filters:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Loaded user:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/rentals");
        const rentals_data = await response.json();
        setRentals(rentals_data || []);
        console.log(rentals_data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchData();
    setMounted(true);
  }, []);

  return (
    <>
      {errorMessage && (
        <div className="text-red-600 font-semibold mb-4">{errorMessage}</div>
      )}

      <form
        onSubmit={handleFilter}
        className="background flex justify-center bg-gray-100 p-4 rounded-lg mb-6 space-y-2"
      >
        <div className="flex gap-4 flex-wrap">
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
        </div>
        <button
          type="submit"
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Filter
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
        >
          Reset Filters
        </button>
      </form>

      {/*Rental Cards Display */}
<div className="Card flex flex-center flex-col">
  <div className="background container mx-auto flex justify-evenly flex-wrap">
    {rentals.map((rental) => (
      <div key={rental.apartment_id}>
        <RentalCard rental={rental} />
      </div>
    ))}
  </div>
</div>   </>
  );
}
