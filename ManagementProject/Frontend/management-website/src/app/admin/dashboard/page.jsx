'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:8080/admin/dashboard', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Unauthorized');

        const json = await res.json();
        setData(json);
        console.log("Parsed dashboard response:", json);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Session expired or unauthorized');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/admin/login');
    }
  };

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );

  if (!data)
    return (
      <p className="p-4 text-gray-600">
        No data available. Try refreshing the page.
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-700">
            Total Apartments
          </h2>
          <p className="text-3xl font-bold text-blue-700">
            {data.apartmentCount}
          </p>
        </div>

        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-medium text-gray-700">
            Registered Users
          </h2>
          <p className="text-3xl font-bold text-green-700">{data.userCount}</p>
        </div>
      </div>

      {data.adminEmail && (
        <div className="mt-6 text-gray-500">
          Logged in as <span className="font-semibold">{data.adminEmail}</span>
        </div>
      )}
    </div>
  );
}