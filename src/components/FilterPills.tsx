
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

type FilterOption = 'all' | 'pending' | 'high-confidence';

interface FilterPillsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const filters: { label: string; value: FilterOption }[] = [
  { label: 'All Leads', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'High Confidence', value: 'high-confidence' },
];

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<FilterOption, number | null>>({
    all: null,
    pending: null,
    'high-confidence': null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        setLoading(true);
        const leadsRef = collection(db, 'leads');
        const userQuery = where('userId', '==', user.uid);

        const allQuery = query(leadsRef, userQuery);
        const pendingQuery = query(leadsRef, userQuery, where('status', '==', 'pending'));
        const highConfidenceQuery = query(leadsRef, userQuery, where('status', '==', 'pending'), where('confidence', '>=', 0.8));

        const [allSnap, pendingSnap, highConfidenceSnap] = await Promise.all([
          getCountFromServer(allQuery),
          getCountFromServer(pendingQuery),
          getCountFromServer(highConfidenceQuery),
        ]);

        setCounts({
          all: allSnap.data().count,
          pending: pendingSnap.data().count,
          'high-confidence': highConfidenceSnap.data().count,
        });
      } catch (error) {
        console.error("Failed to fetch lead counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  if (loading) {
    return (
      <div className="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm p-4 -mx-4 -mt-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map(filter => <Skeleton key={filter.value} className="h-8 w-24 rounded-full" />)}
        </div>
      </div>
    )
  }


  return (
    <div className="sticky top-0 z-10 bg-muted/40 backdrop-blur-sm p-4 -mx-4 -mt-4 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
            <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={cn(
                'rounded-full whitespace-nowrap',
                activeFilter === filter.value && 'bg-primary text-primary-foreground'
            )}
            >
            {filter.label}
            {counts[filter.value] !== null && (
                <span className={cn(
                    'ml-2 rounded-full px-2 text-xs',
                    activeFilter === filter.value
                        ? 'bg-primary-foreground/20'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                )}>
                {counts[filter.value]}
                </span>
            )}
            </Button>
        ))}
        </div>
    </div>
  );
}
