
import Link from 'next/link';

interface StatusBannerProps {
  plan: string;
  credits: number;
}

export const StatusBanner = ({ plan, credits }: StatusBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg flex justify-between items-center">
      <div>
        <p className="font-semibold">Plan: <span className="font-normal">{plan}</span></p>
        <p className="font-semibold">Credits: <span className="font-normal">{credits}</span></p>
      </div>
      <Link href="/settings/billing">
        <p className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-gray-100 cursor-pointer">Upgrade Plan</p>
      </Link>
    </div>
  );
};
