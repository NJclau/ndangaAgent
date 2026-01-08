
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config'; // Assuming you have a file that exports your firestore instance

export const useCollection = <T,>(path: string, options?: any) => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = collection(db, path);

    if (options?.where) {
        options.where.forEach((w: any) => {
            q = query(q, where(w[0], w[1], w[2]));
        });
    }
    if (options?.orderBy) {
        q = query(q, orderBy(options.orderBy[0], options.orderBy[1]));
    }
    if (options?.limit) {
        q = query(q, limit(options.limit));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, options]);

  return { data, loading, error };
};
