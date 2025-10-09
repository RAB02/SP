'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleGalleryClick = (e) => {
    e.preventDefault();
    if (pathname === "/") {
      const gallerySection = document.getElementById("gallery");
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = "/#gallery";
    }
  };

  const linkClass = `text-lg ${
    pathname === "/" && !isScrolled ? "text-white" : "text-black"
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        pathname === "/"
          ? isScrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
          : "bg-white shadow-md"
      }`}
    >
      <ul className="list-none flex flex-row space-x-4 w-full justify-around text-center items-center py-4">

        <li>
          {/* Dropdown Menu */}
          <Menu as="div" className="relative inline-block text-center">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
              TBD
              <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg outline outline-1 -outline-offset-1 outline-white/10 data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <a
                    href="/signin"
                    className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white"
                  >
                    Sign Up
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/rentals"
                    className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white"
                  >
                    For Rent
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/contact"
                    className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white"
                  >
                    Contact
                  </a>
                </MenuItem>
                <form action="#" method="POST">
                  <MenuItem>
                    <a
                    href="/residents"
                    className="block px-4 py-2 text-sm text-gray-300 data-[focus]:bg-white/5 data-[focus]:text-white"
                  >
                    Residents
                  </a>
                  </MenuItem>
                </form>
              </div>
            </MenuItems>
          </Menu>
        </li>

        <li>
          <a href="/" className={linkClass}>
            Home
          </a>
        </li>

        <li>
          <a href="#gallery" onClick={handleGalleryClick} className={linkClass}>
            Gallery
          </a>
        </li>

        <li>
          <a href="/login" className={linkClass}>
            Log In
          </a>
        </li>
      
      </ul>
    </nav>
  );
}