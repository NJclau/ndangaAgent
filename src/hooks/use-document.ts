'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function useDocument<T extends DocumentData>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!path) {
        setLoading(false);
        return;
    }

    const docRef = doc(db, path);

    const unsubscribe = onSnapshot(docRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      }, 
      (err) => {
        console.error("useDocument snapshot error:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}
