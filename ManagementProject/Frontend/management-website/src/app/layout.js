'use client';
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { User } from "react-feather";
import { UserProvider } from "@/components/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="background flex flex-col min-h-screen">
          <UserProvider>
          {/* Navbar at the top */}
          <Navbar />

            {/* Content that expands to push the footer down */}
            <main className={`flex-grow ${isHomePage ? "" : "pt-20"}`}>
              {children}
            </main>

          </UserProvider>
          {/* Footer always at the bottom */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
