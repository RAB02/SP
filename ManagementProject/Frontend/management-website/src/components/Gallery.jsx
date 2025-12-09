"use client";

import { useEffect, useState } from "react";
import { Carousel } from "./ui/Carousel"; // adjust path if needed

export default function Gallery() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    async function fetchRentals() {
      try {
        const res = await fetch("http://localhost:8080/rentals");
        if (!res.ok) throw new Error("Failed to load rentals");

        const data = await res.json();
        console.log("Rentals data:", data);

        const formattedSlides = data.map((rental) => {
          let src = "/placeholder.jpg";

          if (rental.Img) {
            // if Img is already an https URL (like your Pexels links), use it directly
            src = rental.Img;
          }

          return {
            src,
            title:
              rental.apartment_name ||
              rental.address ||
              `Apartment ${rental.apartment_id}`,
            address: rental.address,
            bed: rental.bed,
            bath: rental.bath,
            pricing: rental.pricing,
            apartment_id: rental.apartment_id,
          };
        });

        setSlides(formattedSlides);
      } catch (err) {
        console.error("Error fetching rentals:", err);
      }
    }

    fetchRentals();
  }, []);

  return (
    <section className=" w-full  flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6 text-center">Gallery</h2>

      <div className="flex justify-center w-full">
        <Carousel slides={slides} />
      </div>
    </section>
  );
}
