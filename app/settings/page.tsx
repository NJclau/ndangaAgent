
'use client';

import { useState } from 'react';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { BillingTab } from '@/components/settings/BillingTab';

const tabs = [
  { name: 'Profile', component: ProfileTab },
  { name: 'Notifications', component: () => <div>Notifications Settings</div> },
  { name: 'Billing', component: BillingTab },
  { name: 'Security', component: () => <div>Security Settings</div> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex">
        <div className="md:w-1/4">
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab.name
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="md:w-3/4 md:pl-8 mt-8 md:mt-0">
            {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
