
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, startAfter, getDocs, onSnapshot, getCountFromServer, DocumentData, Query, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Mock Auth Hook
const useAuth = () => ({
    user: {
      uid: 'test-user-id',
    },
  });

const buildQuery = (userId: string, filter: string | null, lastVisible: QueryDocumentSnapshot<DocumentData> | null) => {
    let q: Query = collection(db, 'leads');

    q = query(q, where('userId', '==', userId));

    if (filter === 'new') {
        q = query(q, where('status', '==', 'new'));
    }

    if (filter === 'high') {
        q = query(q, where('confidence', '>=', 80));
    }

    q = query(q, orderBy('confidence', 'desc'), orderBy('createdAt', 'desc'));

    if(lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    q = query(q, limit(20));

    return q;
};

export const useInfiniteLeads = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [filter, setFilter] = useState<string | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [counts, setCounts] = useState({ new: 0, high: 0 });

    const loadMore = useCallback(async () => {
        if (!hasMore || loading || !user) return;
        setLoading(true);

        const q = buildQuery(user.uid, filter, lastVisible);
        const documentSnapshots = await getDocs(q);

        const newLeads = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(prev => [...prev, ...newLeads]);

        const last = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(last);

        if (documentSnapshots.docs.length < 20) {
            setHasMore(false);
        }
        setLoading(false);
    }, [hasMore, loading, user, filter, lastVisible]);

    useEffect(() => {
        if (!user) return;

        // Reset on filter change
        setLeads([]);
        setLastVisible(null);
        setHasMore(true);
        loadMore();
    }, [filter, user]);

    useEffect(() => {
        if (!user) return;

        // Real-time updates
        const q = query(collection(db, 'leads'), where('userId', '==', user.uid), where('createdAt', '>', new Date()));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newLeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if(newLeads.length > 0) {
                setLeads(prev => [...newLeads, ...prev]);
                // You can add a toast notification here
                console.log(`${newLeads.length} new leads arrived`);
            }
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if(!user) return;

        const fetchCounts = async () => {
            const newCountQuery = query(collection(db, 'leads'), where('userId', '==', user.uid), where('status', '==', 'new'));
            const highCountQuery = query(collection(db, 'leads'), where('userId', '==', user.uid), where('confidence', '>=', 80));

            const [newCount, highCount] = await Promise.all([
                getCountFromServer(newCountQuery),
                getCountFromServer(highCountQuery)
            ]);

            setCounts({ new: newCount.data().count, high: highCount.data().count });
        };

        fetchCounts();
    }, [user]);

    return { leads, filter, setFilter, loadMore, loading, hasMore, counts };
};
