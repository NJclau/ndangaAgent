
'use client';

import { useInfiniteLeads } from '@/hooks/useInfiniteLeads';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FilterPills } from '@/components/FilterPills';
import { IntelligenceCard } from '@/components/IntelligenceCard';
import { Search } from 'lucide-react'; // Assuming lucide-react is installed

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

const EmptyState = ({ onClear }: { onClear: () => void }) => (
    <div className="text-center py-16">
        <Search className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
        <p className="mt-1 text-sm text-gray-500">No leads found matching this filter.</p>
        <div className="mt-6">
            <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Clear Filters
            </button>
        </div>
    </div>
);

export default function LeadsPage() {
  const { leads, filter, setFilter, loadMore, loading, hasMore, counts } = useInfiniteLeads();

  const { sentinelRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !loading,
  });

  const handleFilterChange = (newFilter: string | null) => {
    // Prevent re-fetching if the filter is the same
    if (filter !== newFilter) {
        setFilter(newFilter);
    }
  }

  const clearFilters = () => {
    setFilter(null);
  };

  const showEmptyState = !loading && leads.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FilterPills active={filter} onFilterChange={handleFilterChange} counts={counts} />

        {showEmptyState ? (
            <EmptyState onClear={clearFilters} />
        ) : (
            <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                    {leads.map(lead => (
                        <li key={lead.id} className="py-5 animate-fade-in">
                           <IntelligenceCard leadId={lead.id} />
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <div ref={sentinelRef} id="sentinel" />

        {loading && <LoadingSpinner />}

        {!hasMore && !showEmptyState && (
            <p className="text-center text-sm text-gray-500 py-8">You've reached the end of the list.</p>
        )}
    </div>
  );
}
