
'use client';
import { useState, useMemo, useCallback } from 'react';
import { IntelligenceCard } from '@/components/intelligence-card';
import { ListFilter, Loader2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useInfiniteLeads } from '@/hooks/useInfiniteLeads';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FilterPills } from '@/components/FilterPills';
import { Skeleton } from '@/components/ui/skeleton';

type SortOption = 'newest' | 'confidence';
type FilterOption = 'all' | 'pending' | 'high-confidence';

export default function LeadsPage() {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filter, setFilter] = useState<FilterOption>('pending');
  
  const { leads, loading, loadingMore, hasMore, loadMore } = useInfiniteLeads({ sort, filter });

  const { sentinelRef } = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: hasMore && !loadingMore,
  });

  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
  }, []);

  const CardSkeleton = () => (
    <Card className="space-y-4 p-6 animate-pulse">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
        </div>
    </Card>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Leads</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Sort
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={sort === 'newest'} onClick={() => setSort('newest')}>
              Newest
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={sort === 'confidence'} onClick={() => setSort('confidence')}>
              Highest Confidence
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <FilterPills activeFilter={filter} onFilterChange={handleFilterChange} />
      
      <div className="space-y-4 flex-grow">
        {loading ? (
           Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-48 w-full rounded-lg" />
           ))
        ) : leads.length > 0 ? (
          leads.map((lead) => (
            <IntelligenceCard key={lead.id} leadId={lead.id} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-lg bg-card border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No leads found</h3>
              <p>No leads matched your current filter.</p>
               <Button variant="link" onClick={() => setFilter('all')}>
                Clear filters
              </Button>
          </div>
        )}
        
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-10" />

        {loadingMore && (
           <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary"/>
           </div>
        )}

        {!loading && !hasMore && leads.length > 0 && (
            <div className="text-center text-muted-foreground py-4">
                You're all caught up!
            </div>
        )}
      </div>
    </div>
  );
}

// Dummy Card component to satisfy type checker for skeleton
const Card: React.FC<{className: string, children: React.ReactNode}> = ({ className, children }) => <div className={className}>{children}</div>;
