
'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config'; // Assuming you export functions instance from here

// Mock data
const mockPlan = 'Pro';
const mockCredits = 350;
const mockPaymentMethod = '•••• 1234';
const mockBillingHistory = [
    { id: 1, date: '2023-10-26', amount: '$29.00', status: 'Paid' },
    { id: 2, date: '2023-09-26', amount: '$29.00', status: 'Paid' },
];

export const BillingTab = () => {
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const initializePayment = httpsCallable(functions, 'initializePayment');
      await initializePayment({ 
        plan: 'pro', 
        amount: 29, // Example amount
        phoneNumber 
      });
      setShowModal(false);
      // You can show a success message or poll for payment status
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Current Plan</h3>
        <p className="mt-1 text-sm text-gray-500">You are currently on the <span className="font-semibold">{mockPlan}</span> plan.</p>
      </div>

      {/* Credits */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Credits</h3>
        <div className="mt-2">
            <p className="text-sm text-gray-500">{mockCredits} credits remaining</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(mockCredits / 1000) * 100}%`}}></div>
            </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Method</h3>
        <div className="mt-2 flex items-center">
          <p className="text-sm text-gray-500">MTN MoMo: {mockPaymentMethod}</p>
          <button onClick={() => setShowModal(true)} className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">Update</button>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">Billing History</h3>
        <div className="mt-2 -mx-4 sm:-mx-0">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockBillingHistory.map((item) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
        </div>
      </div>

      {/* Update Payment Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Update Payment Method</h3>
                    <div className="mt-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">MTN MoMo Phone Number</label>
                        <input
                            type="text"
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+256..."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleUpdatePayment}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Submit'}
                </button>
                <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                    Cancel
                </button>
                </div>
            </div>
            </div>
        </div>
      )}
    </div>
  );
};
