
'use client';

import { useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface FilterPillsProps {
  active: string | null;
  onFilterChange: (filter: string | null) => void;
  counts: { new: number; high: number };
}

export const FilterPills = ({ active, onFilterChange, counts }: FilterPillsProps) => {
  const debounced = useDebouncedCallback(
    (value) => {
        onFilterChange(value);
    },
    300
  );

  const filters = useMemo(() => [
    { label: 'All', value: null },
    { label: 'New', value: 'new', count: counts.new },
    { label: 'High Confidence', value: 'high', count: counts.high },
  ], [counts]);

  return (
    <div className="sticky top-0 z-10 bg-white py-4">
      <div className="flex space-x-2">
        {filters.map(filter => (
          <button 
            key={filter.label}
            onClick={() => debounced(filter.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${active === filter.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {filter.label} {filter.count !== undefined && <span className="ml-1 text-xs">{filter.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
