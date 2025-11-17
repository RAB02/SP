"use client";
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check admin
        const adminRes = await fetch("http://localhost:8080/admin/verify", {
          credentials: "include",
        });
        const adminData = await adminRes.json();
        setAdmin(adminData.loggedIn || false);

        // Check user
        const userRes = await fetch("http://localhost:8080/verify", {
          credentials: "include",
        });
        const userData = await userRes.json();
        setUser(userData.loggedIn ? userData.user : null);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setUser(null);
        setAdmin(false);
      }
    };

    checkStatus();

    // 🔥 Listen for auth changes
    const refresh = () => checkStatus();
    window.addEventListener("userChange", refresh);
    window.addEventListener("adminChange", refresh);

    return () => {
      window.removeEventListener("userChange", refresh);
      window.removeEventListener("adminChange", refresh);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, admin, setAdmin }}>
      {children}
    </UserContext.Provider>
  );
}
