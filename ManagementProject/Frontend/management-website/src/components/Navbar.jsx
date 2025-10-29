'use client';

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { UserContext } from "./UserContext"; // 👈 import context

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, setUser } = useContext(UserContext); // 👈 use shared user state

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleGalleryClick = (e) => {
    e.preventDefault();
    if (pathname === "/") {
      const gallerySection = document.getElementById("gallery");
      if (gallerySection) gallerySection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#gallery";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const linkClass = `text-lg ${
    pathname === "/" && !isScrolled ? "text-white" : "text"
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        pathname === "/"
          ? isScrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
          : "accent"
      }`}
    >
      <ul className="list-none flex flex-row space-x-4 w-full justify-around text-center items-center py-4 font-medium">

        {/* --- Dropdown Menu --- */}
        
        <li>
        {user ? (
          <Menu as="div" className="relative inline-block text-center">
            <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
              TBD
              <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg outline outline-1 -outline-offset-1 outline-white/10 
              px-4 py-2 left-1/2 -translate-x-1/2 max-w-[90vw]
              data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                <MenuItem>
                  <a
                    href="/rentals"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    For Rent
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/contact"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Contact
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/about"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    About
                  </a>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
          ): (
            <Menu as="div" className="relative inline-block text-center">
              <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                TBD
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg outline outline-1 -outline-offset-1 outline-white/10 
                px-4 py-2 left-1/2 -translate-x-1/2 max-w-[90vw]
                data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="/signin"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Sign Up
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="/rentals"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      For Rent
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="/contact"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Contact
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="/about"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      About
                    </a>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          )
        }
        </li>

        {/* --- Navigation Links --- */}
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

        {/* --- Log In / User Dropdown --- */}
        <li>
          {user ? (
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                {user.name || user.username || "User"}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 h-5 w-5" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="py-1">
                  <MenuItem>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Profile
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Log Out
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          ) : (
            <a href="/login" className={linkClass}>
              Log In
            </a>
          )}
        </li>
      </ul>
    </nav>
  );
}