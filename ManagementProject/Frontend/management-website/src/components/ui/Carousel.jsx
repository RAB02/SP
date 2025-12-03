"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";

const Slide = ({ slide, index, current, handleSlideClick }) => {
  const slideRef = useRef(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      const x = xRef.current;
      const y = yRef.current;
      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, []);

  const handleMouseMove = (event) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event) => {
    event.currentTarget.style.opacity = "1";
  };

  // ✅ Destructure rental fields
  const { src, title, address, bed, bath, pricing, apartment_id } = slide;

  return (
    <li
      ref={slideRef}
      className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-opacity duration-500 ${
        current === index ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={() => handleSlideClick(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: current === index ? "scale(1)" : "scale(0.98)",
        transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out",
      }}
    >
      {/* Image background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[1%] overflow-hidden">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-in-out"
          style={{ opacity: current === index ? 1 : 0.5 }}
          alt={title}
          src={src}
          onLoad={imageLoaded}
        />
        {current === index && <div className="absolute inset-0 bg-black/30" />}
      </div>

      {/* Rental card overlay */}
      <article
  className={`relative bg-white text-gray-900 rounded-lg shadow-md p-6 w-[80%] max-w-lg transition-opacity duration-1000 ease-in-out ${
    current === index ? "opacity-100 visible" : "opacity-0 invisible"
  }`}
>
  <h2 className="text-lg md:text-2xl font-semibold">{address || title}</h2>
  <p className="text-gray-600">{bed} Beds • {bath} Baths</p>
  <p className="text-gray-800 font-bold">${pricing}</p>
  {apartment_id && (
    <a
      href={`/rentals/${apartment_id}`}
      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Apply Now
    </a>
  )}
</article>

    </li>
  );
};



export function Carousel({ slides = [] }) {
  const [current, setCurrent] = useState(0);

  if (!slides.length) return null;

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextClick = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-[140vmin] h-[80vmin] mx-auto overflow-hidden">
      <ul className="relative w-full h-full">
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={setCurrent}
          />
        ))}
      </ul>
      <div className="absolute flex justify-between w-full top-1/2 -translate-y-1/2 px-4">
        <button onClick={handlePreviousClick} className="text-white bg-black/50 p-3 rounded-full">
          ❮
        </button>
        <button onClick={handleNextClick} className="text-white bg-black/50 p-3 rounded-full">
          ❯
        </button>
      </div>
    </div>
  );
}
