'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecentlyViewed() {
  const [items, setItems] = useState([]);

  const loadItems = () => {
    try {
      const raw = localStorage.getItem('recentlyViewedRentals');
      if (!raw) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Failed to load recently viewed items', err);
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();

    const handleStorageChange = (e) => {
      if (e.key === 'recentlyViewedRentals') {
        loadItems();
      }
    };

    const handleCustomEvent = () => loadItems();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('recentlyViewedUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recentlyViewedUpdated', handleCustomEvent);
    };
  }, []);

  // Reliable fallback image (indigo-themed placeholder)
  const DEFAULT_IMAGE = 'https://placehold.co/80x80/6366f1/ffffff/png?text=Apt&font=roboto';

  const getImageUrl = (item) => {
    const possible = item.Image || item.img || item.image || '';
    const url = typeof possible === 'string' ? possible.trim() : '';
    return url && (url.startsWith('http') || url.startsWith('data:')) ? url : DEFAULT_IMAGE;
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Recently viewed</h2>
        <p className="text-sm text-gray-600">
          You haven't viewed any apartments yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recently viewed</h2>
      <ul className="space-y-4">
        {items.slice(0, 6).map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors"
          >
            {/* Thumbnail */}
            <Link href={`/rentals/${item.id}`} className="flex-shrink-0">
              <img
                src={getImageUrl(item)}
                alt={item.Apartment || 'Apartment'}
                width={64}
                height={64}
                loading="lazy"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 hover:opacity-90 transition-opacity bg-gray-100"
                onError={(e) => {
                  if (!e.target.src.includes('placeholder.com')) {
                    e.target.src = DEFAULT_IMAGE;
                  }
                }}
              />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/rentals/${item.id}`}
                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline block truncate"
              >
                {item.Apartment || 'Unnamed Apartment'}
              </Link>
              <div className="text-xs text-gray-600 mt-1">
                {item.Bed ?? item.bedrooms ?? '–'} bed •{' '}
                {item.Bath ?? item.bathrooms ?? '–'} bath •{' '}
                ${item.Pricing ?? item.price ?? '???'}
                {item.Pricing && !isNaN(item.Pricing) ? '' : '/mo'}
              </div>
            </div>

            {/* View Link */}
            <Link
              href={`/rentals/${item.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0"
            >
              View →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}