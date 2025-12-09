"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { UserContext } from "./UserContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, setUser, admin, setAdmin } = useContext(UserContext);
  const isAdminLogin = pathname === "/admin/login";

  // ✅ Check both user & admin cookies on mount and when events fire
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check admin cookie (401 is expected if not admin, so we handle it gracefully)
        try {
          const adminRes = await fetch("http://localhost:8080/admin/verify", {
            credentials: "include",
          });
          if (adminRes.ok) {
            const adminData = await adminRes.json();
            setAdmin(adminData.loggedIn || false);
          } else {
            setAdmin(false); // Not an admin, which is fine
          }
        } catch (adminErr) {
          setAdmin(false); // Not an admin or error checking
        }

        // Check user cookie
        try {
          const userRes = await fetch("http://localhost:8080/verify", {
            credentials: "include",
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData.loggedIn ? userData.user : null);
          } else {
            setUser(null); // Not logged in as user
          }
        } catch (userErr) {
          setUser(null); // Error checking user status
        }
      } catch (err) {
        // Fallback: clear both if there's a network error
        setAdmin(false);
        setUser(null);
      }
    };

    checkAuth();

    // 🔄 Recheck when login/logout events happen
    window.addEventListener("userChange", checkAuth);
    window.addEventListener("adminChange", checkAuth);

    return () => {
      window.removeEventListener("userChange", checkAuth);
      window.removeEventListener("adminChange", checkAuth);
    };
  }, [setUser, setAdmin]);

  // ✅ Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // ✅ Logout — clears both types of cookies if present
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
      await fetch("http://localhost:8080/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }

    setAdmin(false);
    setUser(null);
    window.dispatchEvent(new Event("adminChange"));
    window.dispatchEvent(new Event("userChange"));
    window.location.href = "/";
  };

  const linkClass = `text-lg ${
    pathname === "/" && !isScrolled ? "text-white" : "text"
  }`;

  // ✅ Hide Navbar entirely on admin login page
  if (isAdminLogin) return <nav className="py-4"></nav>;

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
        {/* If on /admin/login, render a blank bar; otherwise render full content */}
        {isAdminLogin ? (
          <>{/* blank nav (keeps height/spacing) */}</>
        ) : (
          <>
            {/* --- Dropdown Menu (Admin/User/Guest) --- */}
            <li>
              {admin ? (
                <Menu as="div" className="relative inline-block text-center">
                  <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                    Admin
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 h-5 w-5"
                    />
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
                          href="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Dashboard
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="/admin/lease"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Leases
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="/admin/payments"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Payments
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="/admin/add-lease"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Add Apartments
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="/admin/applicants"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Applicants
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          href="/admin/maintenance"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Maintenance Forms
                        </a>
                      </MenuItem>
                      <MenuItem>
                        <a
                          onClick={handleLogout}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          Log Out
                        </a>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              ) : user ? (
                <Menu as="div" className="relative inline-block text-center">
                  <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                    User
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 h-5 w-5"
                    />
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
              ) : (
                <Menu as="div" className="relative inline-block text-center">
                  <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                    Guest
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 h-5 w-5"
                    />
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
              )}
            </li>

            {/* --- Navigation Links (hidden when admin) --- */}
            {admin ? (
              <></>
            ) : (
              <>
                <li>
                  <a href="/" className={linkClass}>
                    Home
                  </a>
                </li>
                <li>
                  <a href="/rentals" className={linkClass}>
                    For Rent
                  </a>
                </li>
              </>
            )}

            {/* --- Log In / User Dropdown (hidden when admin) --- */}
            {admin ? (
              <></>
            ) : (
              <li>
                {user ? (
                  <Menu as="div" className="relative inline-block text-left">
                    <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                      {user.name || user.username || "User"}
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="-mr-1 h-5 w-5"
                      />
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div className="py-1">
                        <MenuItem>
                          <a
                            href="/tenants/profile"
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
            )}
          </>
        )}
      </ul>
    </nav>
  );
}
