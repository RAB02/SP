"use client";

import { RentalCarousel } from "@/components/RentalCarousel";
import { GlyphMarker } from "@/components/GlyphMarker"; 
import { DatasetLayer } from "@/components/DatasetLayer";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";

export default function RentalDetails() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [error, setError] = useState(false);
  const [position, setPosition] = useState({ lat: 26.3017, lng: -98.1633 });

  useEffect(() => {
  if (!id) return;

  const fetchRental = async () => {
    try {
      const response = await fetch(`http://localhost:8080/rentals/${id}`);
      if (!response.ok) throw new Error("Rental not found");
      const data = await response.json();
      console.log(data);
      setRental(data);

      if (data.lat && data.lon) {
        setPosition({
          lat: Number(data.lat),
          lng: Number(data.lon),
        });
      }

      // Save to recently viewed
      try {
        const recentlyViewed = JSON.parse(
          localStorage.getItem("recentlyViewedRentals") || "[]"
        );

        // --- NORMALIZE IMAGE URL (your logic) ---
        const normalizeImageUrl = (img) => {
          if (!img) {
            return "https://via.placeholder.com/288x224?text=No+Image";
          }

          if (img.startsWith("http")) {
            return img;
          }

          const path = img.startsWith("/") ? img : `/${img}`;
          return `http://localhost:8080${path}`;
        };

        // Extract first image from data.Img
        let rawImage = null;

        if (Array.isArray(data.Img) && data.Img.length > 0) {
          rawImage = data.Img[0];
        } else if (data.Img) {
          // fallback if it's ever a single string
          rawImage = data.Img;
        }

        // Apply your normalization logic
        const imageUrl = normalizeImageUrl(rawImage);

        // Save simplified rental object
        const rentalToSave = {
          id: data.ApartmentID || data.apartment_id || id,
          Apartment: data.Apartment || data.apartment_name || "Apartment",
          Bed: data.Bed || data.bed || "N/A",
          Bath: data.Bath || data.bath || "N/A",
          Pricing: data.Pricing || data.pricing || "N/A",
          Image: imageUrl,
        };

        // Remove duplicates
        const filtered = recentlyViewed.filter(
          (item) => item.id !== rentalToSave.id
        );

        // Add to front and keep only 10
        const updated = [rentalToSave, ...filtered].slice(0, 10);

        localStorage.setItem(
          "recentlyViewedRentals",
          JSON.stringify(updated)
        );

        // Notify RecentlyViewed component
        window.dispatchEvent(new Event("recentlyViewedUpdated"));
      } catch (storageErr) {
        console.error("Error saving to recently viewed:", storageErr);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  fetchRental();
}, [id]);

  if (!rental && !error)
    return <div className="bg-white h-screen w-screen"></div>;
  if (error) return <div className="bg-white h-screen w-screen"></div>;

  return (
    <div className="bg-white min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      {/* Apartment Info */}
      <section className="bg-gray-100 rounded-xl shadow-md p-4 space-y-3">
        <RentalCarousel images={rental.Img || []} />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{rental.apartment_name}</h1>
          <p className="text-gray-600">{rental.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
          <p>
            <strong>Rent:</strong> ${rental.pricing}
          </p>
          <p>
            <strong>Beds:</strong> {rental.bed}
          </p>
          <p>
            <strong>Baths:</strong> {rental.bath}
          </p>
          <p>
            <strong>Pets Allowed:</strong> OK
          </p>
          <p>
            <strong>Availability:</strong> Available Now
          </p>
        </div>
      </section>

      {/* Google Map */}
      <section className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={12}
            defaultCenter={position}
            mapId="3a1f0c586d6d8074291e19c0"
            fullscreenControl
            className="w-full h-[50vh]"
          >
            <DatasetLayer datasetId="b9146f92-f35a-4b58-946e-2154c13ffb41" />
            <GlyphMarker position={position} rental={rental} />
          </Map>
        </APIProvider>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-wrap justify-center gap-4">
        <Link
          href={`/apply?rental=${encodeURIComponent(rental.apartment_name)}`}
        >
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
            Apply Now
          </button>
        </Link>

        <Link
          href={`/contact?rental=${encodeURIComponent(rental.apartment_name)}`}
        >
          <button className="bg-slate-500 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
            Contact
          </button>
        </Link>
      </section>
    </div>
  );
}
