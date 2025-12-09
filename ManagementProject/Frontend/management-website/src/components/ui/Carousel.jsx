// "use client";

// import { IconArrowNarrowRight } from "@tabler/icons-react";
// import { useState, useRef, useEffect } from "react";

// const Slide = ({ slide, index, current, handleSlideClick }) => {
//   const slideRef = useRef(null);
//   const xRef = useRef(0);
//   const yRef = useRef(0);
//   const frameRef = useRef();

//   useEffect(() => {
//     const animate = () => {
//       if (!slideRef.current) return;
//       slideRef.current.style.setProperty("--x", `${xRef.current}px`);
//       slideRef.current.style.setProperty("--y", `${yRef.current}px`);
//       frameRef.current = requestAnimationFrame(animate);
//     };
//     frameRef.current = requestAnimationFrame(animate);
//     return () => frameRef.current && cancelAnimationFrame(frameRef.current);
//   }, []);

//   const handleMouseMove = (event) => {
//     const el = slideRef.current;
//     if (!el) return;
//     const r = el.getBoundingClientRect();
//     xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
//     yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
//   };

//   const handleMouseLeave = () => {
//     xRef.current = 0;
//     yRef.current = 0;
//   };

//   const imageLoaded = (event) => {
//     event.currentTarget.style.opacity = "1";
//   };

//   const { src, title, address, bed, bath, pricing, apartment_id } = slide;

//   return (
//     <li
//       ref={slideRef}
//       className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-500 ${
//         current === index ? "opacity-100 visible" : "opacity-0 invisible"
//       }`}
//       onClick={() => handleSlideClick(index)}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//       style={{
//         transform: current === index ? "scale(1)" : "scale(0.98)",
//         transition:
//           "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out",
//       }}
//     >
//       {/* Background image */}
//       <div className="absolute top-0 left-0 w-full h-full rounded-[1%] overflow-hidden bg-[#1D1F2F]">
//         <img
//           className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
//           style={{ opacity: current === index ? 1 : 0.7 }}
//           alt={title}
//           src={src}
//           onLoad={imageLoaded}
//         />
//         {current === index && <div className="absolute inset-0 bg-black/35" />}
//       </div>

//       {/* Bottom-center info card */}
//       <article
//         className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-lg px-6 py-4 w-[80%] max-w-xl border border-white/40 transition-opacity duration-700 ${
//           current === index ? "opacity-100 visible" : "opacity-0 invisible"
//         }`}
//       >
//         <h2 className="text-lg md:text-2xl font-semibold truncate">
//           {address || title}
//         </h2>
//         <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-700">
//           {bed != null && <span>{bed} Beds</span>}
//           {bed != null && bath != null && <span>•</span>}
//           {bath != null && <span>{bath} Baths</span>}
//           {pricing != null && (
//             <>
//               <span>•</span>
//               <span className="font-bold text-gray-900">
//                 ${pricing.toLocaleString?.() || pricing}/mo
//               </span>
//             </>
//           )}
//         </div>

//         {apartment_id && (
//           <a
//             href={`/rentals/${apartment_id}`}
//             className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
//           >
//             View Details
//             <IconArrowNarrowRight size={18} />
//           </a>
//         )}
//       </article>
//     </li>
//   );
// };

// export function Carousel({ slides = [] }) {
//   const [current, setCurrent] = useState(0);

//   if (!slides.length) return null;

//   const handlePreviousClick = () => {
//     setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
//   };

//   const handleNextClick = () => {
//     setCurrent((prev) => (prev + 1) % slides.length);
//   };

//   return (
//     <div className="relative w-full max-w-5xl aspect-[16/9] mx-auto overflow-hidden rounded-2xl">
//       <ul className="relative w-full h-full">
//         {slides.map((slide, index) => (
//           <Slide
//             key={index}
//             slide={slide}
//             index={index}
//             current={current}
//             handleSlideClick={setCurrent}
//           />
//         ))}
//       </ul>

//       {/* Arrows */}
//       <div className="absolute flex justify-between w-full top-1/2 -translate-y-1/2 px-4">
//         <button
//           onClick={handlePreviousClick}
//           className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
//         >
//           ❮
//         </button>
//         <button
//           onClick={handleNextClick}
//           className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
//         >
//           ❯
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

const Slide = ({ slide, index, current, handleSlideClick }) => {
  const slideRef = useRef(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);
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

  const { src, title, address, bed, bath, pricing, apartment_id } = slide;

  return (
    <li
      ref={slideRef}
      className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-500 ${
        current === index ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onClick={() => handleSlideClick(index)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: current === index ? "scale(1)" : "scale(0.98)",
        transition:
          "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out",
      }}
    >
      {/* Background image */}
      <div className="absolute top-0 left-0 w-full h-full rounded-3xl overflow-hidden bg-[#1D1F2F]">
        <img
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          style={{ opacity: current === index ? 1 : 0.7 }}
          alt={title}
          src={src}
          onLoad={imageLoaded}
        />
        {current === index && <div className="absolute inset-0 bg-black/35" />}
      </div>

      {/* Bottom-center info card */}
      <article
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-gray-900 rounded-2xl shadow-lg px-6 py-4 w-[90%] max-w-4xl border border-white/40 transition-opacity duration-700 ${
          current === index ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <h2 className="text-xl md:text-3xl font-semibold truncate">
          {address || title}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-700">
          {bed != null && <span>{bed} Beds</span>}
          {bath != null && <span>{bath} Baths</span>}
          {pricing != null && (
            <span className="font-bold text-gray-900">
              ${pricing.toLocaleString?.() || pricing}/mo
            </span>
          )}
        </div>

        {apartment_id && (
          <a
            href={`/rentals/${apartment_id}`}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            View Details
            <IconArrowNarrowRight size={18} />
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
    <div className="relative w-full max-w-7xl aspect-[21/9] sm:aspect-[16/9] mx-auto overflow-hidden rounded-3xl">
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

      {/* Arrows */}
      <div className="absolute flex justify-between w-full top-1/2 -translate-y-1/2 px-4">
        <button
          onClick={handlePreviousClick}
          className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
        >
          ❮
        </button>
        <button
          onClick={handleNextClick}
          className="text-white bg-black/50 p-3 rounded-full hover:bg-black/70 transition"
        >
          ❯
        </button>
      </div>
    </div>
  );
}