"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export function DatasetLayer({ datasetId }) {
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

      lastClickedFeatureIds.current = e.features.map(
        (f) => f.datasetAttributes?.["globalid"]
      );
      datasetLayer.style = styleDefault;

      const feature = e.features[0];
      const school_name =
        feature.datasetAttributes?.["USER_School_Name"] || "Unnamed Feature";
      const addy =
        feature.datasetAttributes?.["StAddr"] || "No level data available";
      const school_type =
        feature.datasetAttributes?.["School_Type"] || "No level data available";
      const phone =
        feature.datasetAttributes?.["USER_School_Phone"] ||
        "No level data available";
      const score =
        feature.datasetAttributes?.["Score"] || "No score available";

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      const infoWindow = new google.maps.InfoWindow({
        position: e.latLng,
        content: `
          <div style="font-family: sans-serif; max-width: 240px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 6px;">${school_name}</h3>
            <p style="font-size: 14px; color: #555;">${addy}</p>
            <p style="font-size: 14px; color: #555;">${school_type}</p>
            <p style="font-size: 14px; color: #555;">${phone}</p>
            <p style="font-size: 14px; color: #555;">Score: ${score}</p>
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
}