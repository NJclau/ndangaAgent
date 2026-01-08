
'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config'; // Assuming you export functions instance from here

// Mock user data
const mockUser = {
  businessName: 'Acme Inc.',
  businessCategory: 'E-commerce',
};

export const ProfileTab = () => {
  const [businessName, setBusinessName] = useState(mockUser.businessName);
  const [businessCategory, setBusinessCategory] = useState(mockUser.businessCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateUserProfile = httpsCallable(functions, 'updateUserProfile');
      await updateUserProfile({ businessName, businessCategory });
      setSuccess(true);
    } catch (err: any) { // Type assertion here
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700">Business Category</label>
        <input
          type="text"
          id="businessCategory"
          value={businessCategory}
          onChange={(e) => setBusinessCategory(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Profile updated successfully!</p>}
    </form>
  );
};
