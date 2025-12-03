import { useEffect, useState } from "react";
import { Carousel } from "./ui/Carousel";

export default function Gallery() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    async function fetchRentals() {
      try {
        // ✅ Call your Express backend
        const res = await fetch("http://localhost:8080/rentals");
        const data = await res.json();
        console.log("Rentals data:" ,data);

        // ✅ Map DB fields into Carousel format
       const formattedSlides = data.map(rental => ({
            src: rental.Img ? `http://localhost:8080/${rental.Img}` : "/placeholder.jpg",
            title: rental.address || `Apartment ${rental.apartment_id}`,
            address: rental.address,
            bed: rental.bed,
            bath: rental.bath,
            pricing: rental.pricing,
          }));


       

        setSlides([...formattedSlides]);
      } catch (err) {
        console.error("Error fetching rentals:", err);
      }
    }

    fetchRentals();
  }, []);

  return (
    <div className="overflow-hidden flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-6">Gallery</h2>
      <Carousel slides={slides} />
    </div>
  );
}
