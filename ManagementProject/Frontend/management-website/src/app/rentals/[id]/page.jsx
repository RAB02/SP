'use client';
import { RentalCarousel } from "@/components/RentalCarousel";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {APIProvider, Map, useMap, AdvancedMarker} from "@vis.gl/react-google-maps";

function GlyphMarker({ position, rental }) {
  const map = useMap();
  const infoWindowRef = useRef(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    if (!map || !rental) return;

    const infoWindow = new google.maps.InfoWindow({
      position: position,
      content: `
        <div style="font-family: sans-serif; max-width: 240px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">${rental?.Apartment || "Apartment"}</h3>
          <p style="font-size: 14px; color: #555;">${rental?.Address || "Address not available"}</p>
          <p style="font-size: 14px; color: #555;">Rent: $${rental?.Pricing || "N/A"}</p>
        </div>
      `,
    });

    infoWindowRef.current = infoWindow;

    // No map click listener — we’ll use marker click instead

    return () => {
      infoWindow.close();
    };
  }, [map, rental, position]);

  // Click handler for marker (toggles InfoWindow)
  const handleMarkerClick = () => {
    if (!infoWindowRef.current || !map) return;

    if (isOpenRef.current) {
      infoWindowRef.current.close();
      isOpenRef.current = false;
    } else {
      infoWindowRef.current.open({ map });
      isOpenRef.current = true;
    }
  };
  return (
    <AdvancedMarker position={position} title="Rental Location" onClick={handleMarkerClick}>
      <img src="/home.svg" alt="Home Icon" className="w-8 h-8" />
    </AdvancedMarker>
  );
}

const DatasetLayer = ({ datasetId }) => {
  const map = useMap();
  const lastClickedFeatureIds = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || !datasetId) return;

    const datasetLayer = map.getDatasetFeatureLayer(datasetId);
    const styleDefault = {
      strokeColor: "blue",
      strokeWeight: 2.0,
      strokeOpacity: 1.0,
      fillColor: "blue",
      fillOpacity: 0.3,
    };

    datasetLayer.style = styleDefault;

    const handleClick = (e) => {
      if (!e.features?.length) return;

      // Track clicked features
      lastClickedFeatureIds.current = e.features.map(
        (f) => f.datasetAttributes?.["globalid"]
      );
      datasetLayer.style = styleDefault;

      const feature = e.features[0];
      const school_name = feature.datasetAttributes?.["USER_School_Name"] || "Unnamed Feature";
      const addy = feature.datasetAttributes?.["StAddr"] || "No level data available";
      const school_type = feature.datasetAttributes?.["School_Type"] || "No level data available";
      const phone = feature.datasetAttributes?.["USER_School_Phone"] || "No level data available";
      const score = feature.datasetAttributes?.["Score"] || "No score available";

      // Close previous InfoWindow
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Create new InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        position: e.latLng,
        content: `
          <div style="font-family: sans-serif; max-width: 240px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">${school_name}</h3>
            <p style="font-size: 14px; color: #555;">${addy}</p>
            <p style="font-size: 14px; color: #555;">${school_type}</p>
            <p style="font-size: 14px; color: #555;">${phone}</p>
            <p style="font-size: 14px; color: #555;"> Score :${score}</p>
          </div>
        `,
      });

      infoWindow.open(map);
      infoWindowRef.current = infoWindow;
    };

    datasetLayer.addListener("click", handleClick);

    return () => {
      google.maps.event.clearInstanceListeners(datasetLayer);
    };
  }, [map, datasetId]);

  return null;
};

export default function RentalDetails() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [error, setError] = useState(false);
  const [position, setPosition] = useState({ lat: 26.3017, lng: -98.1633 });
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };
    fetchRental();
  }, [id]);

  if (!rental && !error) return <div className="bg-white h-screen w-screen"></div>;
  if (error) return <div className="bg-white h-screen w-screen"></div>;

  return (
    <div className="bg-white min-h-screen p-6 max-w-2xl mx-auto space-y-8">
      {/* Apartment Info */}
      <section className="bg-gray-100 rounded-xl shadow-md p-4 space-y-3">
        <RentalCarousel images={rental.Img || []} />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{rental.Apartment}</h1>
          <p className="text-gray-600">{rental.Address}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
          <p><strong>Rent:</strong> ${rental.Pricing}</p>
          <p><strong>Beds:</strong> {rental.Bed}</p>
          <p><strong>Baths:</strong> {rental.Bath}</p>
          <p><strong>Pets Allowed:</strong> OK</p>
          <p><strong>Availability:</strong> Available Now</p>
        </div>
      </section>

      {/* Google Map */}
      <section className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <APIProvider apiKey="AIzaSyBhtxGJEFFZ2ml-8sawR6TC0XGe5thtFyc">
          <Map
            defaultZoom={12}
            defaultCenter={position}
            mapId="3a1f0c586d6d8074291e19c0"
            fullscreenControl
            className="w-full h-[50vh]"
          >
            <DatasetLayer datasetId="b9146f92-f35a-4b58-946e-2154c13ffb41" />
            <GlyphMarker position={position} rental={rental}/>
          </Map>
        </APIProvider>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-wrap justify-center gap-4">
        <Link href={`/apply?rental=${encodeURIComponent(rental.Apartment)}`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
            Apply Now
          </button>
        </Link>

        <Link href={`/contact?rental=${encodeURIComponent(rental.Apartment)}`}>
          <button className="bg-slate-500 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg shadow">
            Contact
          </button>
        </Link>
      </section>
    </div>
  );
}