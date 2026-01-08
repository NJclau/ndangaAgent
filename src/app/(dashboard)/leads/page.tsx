'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligenceCard } from '@/components/intelligence-card';
import { mockLeads } from '@/lib/data';
import type { Lead } from '@/lib/types';
import { ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  const filteredLeads = (status: Lead['status']) =>
    leads.filter((lead) => lead.status === status);

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
                <DropdownMenuCheckboxItem checked>Newest</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Highest Confidence</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Platform</DropdownMenuLabel>
                <DropdownMenuCheckboxItem>Twitter</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Reddit</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>LinkedIn</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
      <Tabs defaultValue="pending" className="flex-grow">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
          <TabsTrigger value="ignored">Ignored</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <div className="space-y-4">
            {filteredLeads('pending').map((lead) => (
              <IntelligenceCard key={lead.id} leadId={lead.id} />
            ))}
            {filteredLeads('pending').length === 0 && (
                <p className='text-center text-muted-foreground pt-8'>No pending leads.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="replied" className="mt-4">
          <div className="space-y-4">
            {filteredLeads('replied').map((lead) => (
              <IntelligenceCard key={lead.id} leadId={lead.id} />
            ))}
             {filteredLeads('replied').length === 0 && (
                <p className='text-center text-muted-foreground pt-8'>No replied leads yet.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="ignored" className="mt-4">
          <div className="space-y-4">
            {filteredLeads('ignored').map((lead) => (
              <IntelligenceCard key={lead.id} leadId={lead.id} />
            ))}
            {filteredLeads('ignored').length === 0 && (
                <p className='text-center text-muted-foreground pt-8'>No ignored leads.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
