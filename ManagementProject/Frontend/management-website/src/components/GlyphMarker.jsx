"use client";

import { useEffect, useRef } from "react";
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps";

export function GlyphMarker({ position, rental }) {
  const map = useMap();
  const infoWindowRef = useRef(null);
  const isOpenRef = useRef(false);

  useEffect(() => {
    if (!map || !rental) return;

    const infoWindow = new google.maps.InfoWindow({
      position,
      content: `
        <div style="font-family: sans-serif; max-width: 240px;">
          <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">
            ${rental?.apartment_name || "Apartment"}
          </h3>
          <p style="font-size: 14px; color: #555;">
            ${rental?.address || "Address not available"}
          </p>
          <p style="font-size: 14px; color: #555;">
            Rent: $${rental?.pricing || "N/A"}
          </p>
        </div>
      `,
    });

    infoWindowRef.current = infoWindow;

    return () => {
      infoWindow.close();
    };
  }, [map, rental, position]);

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
    <AdvancedMarker
      position={position}
      title="Rental Location"
      onClick={handleMarkerClick}
    >
      <img src="/home.svg" alt="Home Icon" className="w-8 h-8" />
    </AdvancedMarker>
  );
}