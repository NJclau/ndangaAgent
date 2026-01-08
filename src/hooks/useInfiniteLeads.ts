
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Lead } from '@/lib/types';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type SortOption = 'newest' | 'confidence';
type FilterOption = 'all' | 'pending' | 'high-confidence';

interface UseInfiniteLeadsProps {
  sort: SortOption;
  filter: FilterOption;
}

const PAGE_SIZE = 10;

export function useInfiniteLeads({ sort, filter }: UseInfiniteLeadsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);

  const baseQuery = useMemo(() => {
    if (!user) return null;
    let q: Query<DocumentData> = collection(db, 'leads');
    
    q = query(q, where('userId', '==', user.uid));

    if (filter === 'pending') {
      q = query(q, where('status', '==', 'pending'));
    } else if (filter === 'high-confidence') {
      q = query(q, where('confidence', '>=', 0.8), where('status', '==', 'pending'));
    }
    
    if (sort === 'confidence') {
        q = query(q, orderBy('confidence', 'desc'), orderBy('createdAt', 'desc'));
    } else {
        q = query(q, orderBy('createdAt', 'desc'));
    }
    
    return q;
  }, [user, sort, filter]);

  const loadInitialLeads = useCallback(async () => {
    if (!baseQuery) return;
    setLoading(true);
    setLeads([]);
    setLastVisible(null);
    setHasMore(true);

    try {
      const q = query(baseQuery, limit(PAGE_SIZE));
      const documentSnapshots = await getDocs(q);
      
      const newLeads = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(newLeads);

      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching initial leads: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch leads.' });
    } finally {
      setLoading(false);
    }
  }, [baseQuery, toast]);

  useEffect(() => {
    loadInitialLeads();
  }, [loadInitialLeads]);

  const loadMore = useCallback(async () => {
    if (!baseQuery || loadingMore || !hasMore || !lastVisible) return;
    setLoadingMore(true);
    
    try {
      const q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE));
      const documentSnapshots = await getDocs(q);

      const newLeads = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(prevLeads => [...prevLeads, ...newLeads]);

      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more leads: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch more leads.' });
    } finally {
      setLoadingMore(false);
    }
  }, [baseQuery, loadingMore, hasMore, lastVisible, toast]);

  useEffect(() => {
    if (!user || !baseQuery) return;

    // Listen for new leads added after the initial load
    const unsubscribe = onSnapshot(
      query(baseQuery, where('createdAt', '>', Timestamp.now())),
      (snapshot) => {
        const newLeads: Lead[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            newLeads.push({ id: change.doc.id, ...change.doc.data() } as Lead);
          }
        });

        if (newLeads.length > 0) {
          setLeads((prevLeads) => [...newLeads, ...prevLeads]);
          toast({
            title: `${newLeads.length} new ${newLeads.length > 1 ? 'leads' : 'lead'} arrived!`,
          });
        }
      },
      (error) => {
        console.error("Error listening for new leads:", error);
      }
    );

    return () => unsubscribe();
  }, [user, baseQuery, toast]);


  return { leads, loading, loadingMore, hasMore, loadMore };
}

