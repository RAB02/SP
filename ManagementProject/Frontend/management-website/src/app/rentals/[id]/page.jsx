'use client';
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {APIProvider, Map, AdvancedMarker, Pin, InfoWindow,} from "@vis.gl/react-google-maps";

export default function RentalDetails() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [error, setError] = useState(false);
  const position = { lat: 26.3017, lng: -98.1633 };
  const [open, setOpen] = useState(false);


  useEffect(() => {
    if (!id) return;

    const fetchRental = async () => {
      try {
        const response = await fetch(`http://localhost:8080/rentals/${id}`);
        if (!response.ok) throw new Error("Rental not found");
        const data = await response.json();
        setRental(data);
      } catch (err) {
        setError(true);
      }
    };

    fetchRental();
  }, [id]);

  if (!rental && !error) {
    return <div className="bg-white h-screen w-screen"></div>;
  }

  if (error) {
    return <div className="bg-white h-screen w-screen"></div>;
  }

  return (
    <div className="bg-white min-h-screen p-6 max-w-2xl mx-auto">
      {/* Top Info Box */}
      <div className="bg-gray-100 rounded-lg shadow-md p-4 mb-6">
        <div className="w-full h-48 bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-gray-600">Image Placeholder</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{rental.Apartment}</h1>
        <p className="mb-1"><strong>Rent:</strong> {rental.Pricing}</p>
        <p className="mb-1"><strong>Beds:</strong> {rental.Bed}</p>
        <p className="mb-1"><strong>Baths:</strong> {rental.Bath}</p>
        <p className="mb-1"><strong>Pets Allowed:</strong> OK</p>
        <p className="mb-1"><strong>Availability:</strong> Available Now</p>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Apartment Features</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Swimming Pool</li>
          <li>Fitness Center</li>
          <li>Laundry Facilities</li>
          <li>24/7 Maintenance</li>
        </ul>
      </div>

      {/* Google Maps Section */}
      <APIProvider apiKey="AIzaSyBhtxGJEFFZ2ml-8sawR6TC0XGe5thtFyc">
        <div className="w-full h-[60vh] sm:h-[50vh] md:h-[400px] lg:h-[500px] mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <Map zoom={13} center={position} mapId="3a1f0c586d6d8074291e19c0" className="w-full h-[60vh] sm:h-[50vh] md:h-[400px] lg:h-[500px]">
            <AdvancedMarker position={position}/>
          </Map>
        </div>
      </APIProvider>

      {/* Action Buttons */}
      <div className="flex flex-wrap sm:flex-row gap-3 justify-center">
        <Link href={`/apply?rental=${encodeURIComponent(rental.Apartment)}`}> {/*This is to auto fill the form */} 
          <button href="/apply"  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-sm sm:text-base transition">
            Apply Now
          </button>
        </Link>

        <Link href={`/contact?rental=${encodeURIComponent(rental.Apartment)}`}> 
          <button className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg text-sm sm:text-base transition">
            Contact
          </button>
        </Link>
      </div>
    </div>
  );
}