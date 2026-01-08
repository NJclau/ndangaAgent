
'use client';

import { KPICard } from '@/components/KPICard';
import { StatusBanner } from '@/components/StatusBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCollection } from '@/hooks/useCollection';
import { IntelligenceCard } from '@/components/IntelligenceCard';

// Mock Auth Hook
const useAuth = () => ({
    user: {
      uid: 'test-user-id',
      plan: 'Premium',
      credits: 450,
    },
  });

const SkeletonLoader = () => (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, credits, loading: statsLoading } = useDashboardStats();
  const { data: leads, loading: leadsLoading } = useCollection<any>('leads', {
    where: [['userId', '==', user.uid], ['status', '==', 'new'], ['confidence', '>=', 80]],
    orderBy: ['confidence', 'desc'],
    limit: 3
  });

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block w-64 bg-gray-100 p-4">
        {/* Sidebar content */}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto">

        <StatusBanner plan={user.plan} credits={credits} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          {statsLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            <>
              <KPICard title="New Leads" value={stats.newLeads} />
              <KPICard title="Sent Messages" value={stats.sentMessages} />
              <KPICard title="Active Targets" value={stats.activeTargets} />
            </>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Top Priority Leads</h2>
          {leadsLoading ? (
            <div className="space-y-4">
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
            </div>
          ) : (
            <div className="space-y-4">
              {leads?.map((lead) => (
                <IntelligenceCard key={lead.id} leadId={lead.id} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Bottom Nav - for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        {/* Bottom nav content */}
      </div>
    </div>
  );
}
