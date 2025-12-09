"use client";

import { useState, useEffect, useRef } from "react";
import Gallery from "@/components/Gallery";

export default function Home() {
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);

  
  const [listings, setListings] = useState([]);
  const [listingIndex, setListingIndex] = useState(0);

  
  const videos = ["/videos/Video1.mp4", "/videos/Video2.mp4"];

  
  useEffect(() => {
    fetch(videos[0], { method: "HEAD" })
      .then((res) => {
        if (!res.ok) setVideoAvailable(false);
      })
      .catch(() => setVideoAvailable(false));
  }, []);

  const handleVideoEnd = () => {
    setVideoIndex((prev) => (prev + 1) % videos.length);
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.load();
      videoElement.play().catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [videoIndex]);

  // ✅ Fetch rentals from backend
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("http://localhost:8080/rentals");
        if (res.ok) {
          const data = await res.json();
          setListings(data);
        } else {
          console.error("Failed to fetch rentals");
        }
      } catch (err) {
        console.error("Network error fetching rentals:", err);
      }
    };
    fetchListings();
  }, []);

  // Manual navigation (paged groups of 3)
  const nextListings = () => {
    setListingIndex((prev) => {
      const next = prev + 3;
      return next >= listings.length ? 0 : next;
    });
  };

  const prevListings = () => {
    setListingIndex((prev) => {
      const next = prev - 3;
      return next < 0 ? Math.max(listings.length - 3, 0) : next;
    });
  };

  // ✅ Slice 3 listings safely
  const visibleListings = listings.slice(listingIndex, listingIndex + 3);

  return (
    <>
      {videoAvailable ? (
        <div className="relative w-screen h-screen overflow-hidden">
          <video
            ref={videoRef}
            key={videoIndex}
            className="absolute top-0 left-0 w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            preload="auto"
          >
            <source src={videos[videoIndex]} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="relative w-screen h-screen flex justify-center items-center bg-gray-800 text-white text-2xl">
          Image / Video Goes Here
        </div>
      )}

      <div id="gallery" className="min-h-screen w-screen pt-24 pb-20 flex items-start justify-center">

        <div className="basis-2/3 flex flex-col items-center justify-center">
          <Gallery />
        </div>
      </div>
    </>
  );
}
