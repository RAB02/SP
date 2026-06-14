"use client";

import { RentalCarousel } from "@/components/RentalCarousel";
import { GlyphMarker } from "@/components/GlyphMarker"; 
import { DatasetLayer } from "@/components/DatasetLayer";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
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
      const { data, error } = await supabase
        .from("Apartments")
        .select(`
          apartment_id,
          apartment_name,
          address,
          bed,
          bath,
          pricing,
          lat,
          lon,
          ApartmentImages(image_url)
        `)
        .eq("apartment_id", id)
        .single();

      if (error) throw error;

      console.log("SUPABASE DATA:", data);
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

        const imageUrl =
          data.ApartmentImages?.[0]?.image_url ||
          "https://via.placeholder.com/288x224?text=No+Image";

        const rentalToSave = {
          id: data.apartment_id,
          Apartment: data.apartment_name || "Apartment",
          Bed: data.bed || "N/A",
          Bath: data.bath || "N/A",
          Pricing: data.pricing || "N/A",
          Image: imageUrl,
        };

        const filtered = recentlyViewed.filter(
          (item) => item.id !== rentalToSave.id
        );

        const updated = [rentalToSave, ...filtered].slice(0, 10);

        localStorage.setItem(
          "recentlyViewedRentals",
          JSON.stringify(updated)
        );

        window.dispatchEvent(new Event("recentlyViewedUpdated"));
      } catch (storageErr) {
        console.error("Error saving to recently viewed:", storageErr);
      }
    } catch (err) {
      console.error("Supabase error:", err);
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
        <RentalCarousel images={rental.ApartmentImages || []} />

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
