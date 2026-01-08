'use client';

import { useAuth } from '@/hooks/use-auth';
import { useDocument } from '@/hooks/use-document';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AppSidebar from '@/components/app-sidebar';
import AppHeader from '@/components/app-header';
import type { UserProfile } from '@/lib/types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useNotifications } from '@/hooks/use-notifications';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { data: userProfile, loading: profileLoading } = useDocument<UserProfile>(user ? `users/${user.uid}` : '');
  const router = useRouter();
  useNotifications(); // Initialize notification hooks

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (user && !profileLoading && !userProfile) {
        // Create a user profile if it doesn't exist
        const userRef = doc(db, 'users', user.uid);
        setDoc(userRef, {
            id: user.uid,
            phone: user.phoneNumber,
            credits: 100, // Starting credits
            plan: 'free',
            createdAt: new Date(),
        }, { merge: true });
    }
  }, [user, userProfile, profileLoading]);

  if (authLoading || profileLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AppSidebar userProfile={userProfile} />
      <div className="flex flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
