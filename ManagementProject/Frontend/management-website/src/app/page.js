"use client";

import { useState, useEffect, useRef } from "react";
import Gallery from "@/components/Gallery";

export default function Home() {
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);

  // List of videos to cycle through
  const videos = ["/videos/Video1.mp4", "/videos/Video2.mp4"];

  useEffect(() => {
    fetch(videos[0], { method: "HEAD" })
      .then((res) => {
        if (!res.ok) setVideoAvailable(false);
      })
      .catch(() => setVideoAvailable(false));
  }, []);

  // When one video ends → go to next
  const handleVideoEnd = () => {
    setVideoIndex((prev) => (prev + 1) % videos.length);
  };

  // Reload next video on index change
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.load();
      videoElement.play().catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [videoIndex]);

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
          <div className="bg-slate-900 w-full h-full max-h-[90%] max-w-[80%] p-5 rounded-lg shadow-lg">
            <ul className="text-white text-left">
              <li>1</li>
              <li>2</li>
              <li>3</li>
              <li>4</li>
              <li>5</li>
            </ul>
          </div>
        </div>

        <div className="basis-2/3 flex flex-col items-center">
          <Gallery />
        </div>
      </div>
    </>
  );
}
