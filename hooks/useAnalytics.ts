
'use client';

import { useEffect } from 'react';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { usePathname } from 'next/navigation';
import { app } from '@/lib/firebase/config';
import { ANALYTICS_EVENTS } from '@/types/analytics';

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export const useAnalytics = (userId: string, userPlan: string) => {
  const pathname = usePathname();

  useEffect(() => {
    if (analytics && userId) {
      setUserId(analytics, userId);
      setUserProperties(analytics, {
        user_plan: userPlan,
        user_location: 'Kigali', // Default location
      });
    }
  }, [userId, userPlan]);

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, ANALYTICS_EVENTS.PAGE_VIEW, {
        page: pathname,
      });
    }
  }, [pathname]);

  const trackEvent = (eventName: string, params?: { [key: string]: any }) => {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  };

  return { trackEvent };
};
