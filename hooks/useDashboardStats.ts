
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Assuming you have a file that exports your firestore instance

// Mock Auth Hook
const useAuth = () => ({
  user: {
    uid: 'test-user-id',
    plan: 'Premium',
    credits: 450,
  },
});

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ newLeads: 0, sentMessages: 0, activeTargets: 0 });
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const- 
    const queries = {
      newLeads: query(collection(db, 'leads'), where('userId', '==', user.uid), where('status', '==', 'new')),
      sentMessages: query(collection(db, 'actions'), where('userId', '==', user.uid), where('actionType', '==', 'send')),
      activeTargets: query(collection(db, 'targets'), where('userId', '==', user.uid), where('status', '==', 'active')),
    };

    const fetchCounts = async () => {
      try {
        const [newLeadsCount, sentMessagesCount, activeTargetsCount] = await Promise.all([
          getCountFromServer(queries.newLeads),
          getCountFromServer(queries.sentMessages),
          getCountFromServer(queries.activeTargets),
        ]);

        setStats({
          newLeads: newLeadsCount.data().count,
          sentMessages: sentMessagesCount.data().count,
          activeTargets: activeTargetsCount.data().count,
        });
      } catch (error) {
        console.error("Error fetching stats: ", error);
      }
    };

    fetchCounts();

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setCredits(doc.data().credits);
      }
    });
    
    setLoading(false);

    return () => unsubscribe();
  }, [user]);

  return { stats, credits, loading };
};
