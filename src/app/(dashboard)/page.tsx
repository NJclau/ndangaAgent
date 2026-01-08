'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquare, Zap, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect, useState, useMemo } from 'react';
import type { Lead, Target as TargetType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const leadsQuery = query(collection(db, 'leads'), where('userId', '==', user.uid));
    const targetsQuery = query(collection(db, 'targets'), where('userId', '==', user.uid));

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leads:", error);
      setLoading(false);
    });

    const unsubscribeTargets = onSnapshot(targetsQuery, (snapshot) => {
      const targetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TargetType));
      setTargets(targetsData);
    }, (error) => {
      console.error("Error fetching targets:", error);
    });


    return () => {
      unsubscribeLeads();
      unsubscribeTargets();
    };
  }, [user]);

  const { pendingLeads, highConfidenceLeads, activeTargets, chartData, recentHighValueLeads } = useMemo(() => {
    const pending = leads.filter(l => l.status === 'pending');
    const highConfidence = pending.filter(l => l.confidence > 0.8);
    const active = targets.filter(t => t.status === 'active');
    
    const data = [
      { range: '0-20%', leads: leads.filter(l => l.confidence <= 0.2).length },
      { range: '21-40%', leads: leads.filter(l => l.confidence > 0.2 && l.confidence <= 0.4).length },
      { range: '41-60%', leads: leads.filter(l => l.confidence > 0.4 && l.confidence <= 0.6).length },
      { range: '61-80%', leads: leads.filter(l => l.confidence > 0.6 && l.confidence <= 0.8).length },
      { range: '81-100%', leads: leads.filter(l => l.confidence > 0.8).length },
    ];

    const recentHighValue = leads
        .filter(l => l.confidence > 0.8)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    return { 
        pendingLeads: pending, 
        highConfidenceLeads: highConfidence, 
        activeTargets: active, 
        chartData: data,
        recentHighValueLeads: recentHighValue
    };
  }, [leads, targets]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
          <Skeleton className="h-[118px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[415px]" />
          <Skeleton className="col-span-4 md:col-span-3 h-[415px]" />
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeads.length}</div>
            <p className="text-xs text-muted-foreground">Ready for your review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highConfidenceLeads.length}</div>
            <p className="text-xs text-muted-foreground">Leads with over 80% confidence</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTargets.length}</div>
            <p className="text-xs text-muted-foreground">Actively scanning for new leads</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
            <CardDescription>
              A breakdown of all leads by their AI-generated confidence score.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <XAxis dataKey="range" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
                      <ChartTooltip
                          cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                          content={<ChartTooltipContent />}
                      />
                      <Bar dataKey="leads" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent High-Value Leads</CardTitle>
            <CardDescription>
              Your most recent leads with the highest confidence scores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentHighValueLeads.length > 0 ? (
                <div className="space-y-4">
                {recentHighValueLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                        <Zap className="h-4 w-4" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{lead.author} <span className="text-muted-foreground font-normal">{lead.authorHandle}</span></p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{lead.text}</p>
                    </div>
                    <div className="ml-auto font-medium text-primary">
                        {Math.round(lead.confidence * 100)}%
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No high-value leads yet.</p>
                    <p className="text-xs">Keep your targets active to find more.</p>
                </div>
            )}
          </CardContent>
           <CardFooter>
             <Button asChild className='w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground'>
               <Link href="/leads">View All Leads</Link>
             </Button>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
