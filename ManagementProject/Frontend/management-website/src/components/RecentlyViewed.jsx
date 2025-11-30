'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  const loadItems = () => {
    try {
      const raw = localStorage.getItem('recentlyViewedRentals');
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(parsed);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();

    // Listen for storage changes (when viewing apartments updates localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'recentlyViewedRentals') {
        loadItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event in case of same-tab updates
    window.addEventListener('recentlyViewedUpdated', loadItems);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recentlyViewedUpdated', loadItems);
    };
  }, []);

  if (!items.length) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Recently viewed</h2>
        <p className="text-sm text-gray-600">You haven't viewed any apartments yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Recently viewed</h2>
      <ul className="space-y-3">
        {items.slice(0, 6).map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            {/* Thumbnail Image */}
            <Link href={`/rentals/${item.id}`} className="flex-shrink-0">
              <img
                src={item.img || "https://via.placeholder.com/64?text=No+Image"}
                alt={item.Apartment || "Apartment"}
                className="w-16 h-16 rounded object-cover border border-gray-200 hover:opacity-80 transition-opacity"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64?text=No+Image";
                }}
              />
            </Link>
            
            {/* Apartment Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/rentals/${item.id}`}
                className="text-indigo-600 hover:underline font-medium block truncate"
              >
                {item.Apartment}
              </Link>
              <div className="text-xs text-gray-600 mt-1">
                {item.Bed} bed • {item.Bath} bath • ${item.Pricing}
              </div>
            </div>
            
            {/* View Link */}
            <Link
              href={`/rentals/${item.id}`}
              className="text-sm text-blue-600 hover:underline flex-shrink-0"
            >
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}



