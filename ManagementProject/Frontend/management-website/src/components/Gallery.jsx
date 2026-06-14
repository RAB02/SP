"use client";

import { useEffect, useState } from "react";
import { Carousel } from "./ui/Carousel"; // adjust path if needed
import { supabase } from "@/lib/supabaseClient";

export default function Gallery() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    async function fetchRentals() {
      try {
        const { data, error } = await supabase
          .from("Apartments")
          .select(`
            apartment_id,
            apartment_name,
            address,
            bed,
            bath,
            pricing,
            ApartmentImages(image_url)
          `);

        if (error) throw error;

        console.log("SUPABASE RENTALS:", data);

        const formattedSlides = data.map((rental) => {
          const imageUrl =
            rental.ApartmentImages?.[0]?.image_url ||
            "https://via.placeholder.com/600x400?text=No+Image";

          return {
            src: imageUrl,
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
    <section className="w-full flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6 text-center">Gallery</h2>

      <div className="flex justify-center w-full">
        <Carousel slides={slides} />
      </div>
    </section>
  );
}