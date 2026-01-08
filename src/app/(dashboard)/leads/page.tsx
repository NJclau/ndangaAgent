'use client';
import { useState } from 'react';
import { IntelligenceCard } from '@/components/intelligence-card';
import type { Lead } from '@/lib/types';
import { ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

type SortOption = 'newest' | 'confidence';
type FilterOption = 'twitter' | 'reddit' | 'linkedin';

export default function LeadsPage() {
  // State for sorting and filtering will be used later with Firestore queries
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<Set<FilterOption>>(new Set());

  const toggleFilter = (filter: FilterOption) => {
    setFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return newFilters;
    });
  };

  // This will be replaced with a real-time Firestore query
  const leads: Lead[] = [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Leads</h1>
         <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Sort & Filter
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
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={filters.has('twitter')} onClick={() => toggleFilter('twitter')}>
                  Twitter
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filters.has('reddit')} onClick={() => toggleFilter('reddit')}>
                  Reddit
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={filters.has('linkedin')} onClick={() => toggleFilter('linkedin')}>
                  LinkedIn
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
      
      <div className="space-y-4 flex-grow">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <IntelligenceCard key={lead.id} leadId={lead.id} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No leads yet</h3>
              <p>Your leads will appear here once they are discovered.</p>
          </div>
        )}
      </div>
    </div>
  );
}
