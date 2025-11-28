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

      <div id="gallery" className="flex flex-row bg-gray-100 min-h-screen w-screen pt-20">
        <div className="basis-1/3 flex flex-col items-center">
          <h1 className="text-black text-3xl font-bold mb-4">New Listings</h1>
          <div className="bg-slate-900 w-full h-full max-h-[90%] max-w-[80%] p-5 rounded-lg shadow-lg flex flex-col items-center justify-between">
            {/* Up Arrow */}
            <button onClick={prevListings} className="text-white text-2xl mb-2">▲</button>

            {/* Listings */}
            <ul className="text-white text-left flex flex-col gap-4">
              {visibleListings.map((listing) => (
                <li key={listing.apartment_id} className="flex flex-col">
                  <img
                    src={listing.Img || "/placeholder.jpg"}
                    alt={listing.address}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <div className="font-bold">{listing.address}</div>
                  <div>{listing.bed} Beds • {listing.bath} Baths</div>
                  <div>${listing.pricing}</div>
                </li>
              ))}
            </ul>

            {/* Down Arrow */}
            <button onClick={nextListings} className="text-white text-2xl mt-2">▼</button>
          </div>
        </div>

        <div className="basis-2/3 flex flex-col items-center">
          <Gallery />
        </div>
      </div>
    </>
  );
}
