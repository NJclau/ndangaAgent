
import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  enabled?: boolean;
}

export const useIntersectionObserver = ({ onIntersect, enabled = true }: UseIntersectionObserverProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && enabled) {
      onIntersect();
    }
  }, [enabled, onIntersect]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '100px' });
    const sentinel = sentinelRef.current;

    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [handleIntersect]);

  return { sentinelRef };
};
