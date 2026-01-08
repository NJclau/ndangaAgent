
import { getCrashlytics, log, recordError, setUserId as setCrashlyticsUserId } from 'firebase/crashlytics';
import { app } from '@/lib/firebase/config';

let crashlytics;

try {
    if (typeof window !== 'undefined') {
        crashlytics = getCrashlytics(app);
    }
} catch (e) {
    console.error("Crashlytics initialization failed", e);
}

export const logCrashlyticsError = (error: Error, context?: Record<string, any>) => {
  if (!crashlytics) return;

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      log(crashlytics, `${key}: ${String(value)}`);
    });
  }
  recordError(crashlytics, error);
};

export const logCrashlyticsMessage = (message: string) => {
    if (!crashlytics) return;
    log(crashlytics, message);
}

export const setCrashlyticsUserId = (userId: string) => {
    if (!crashlytics) return;
    setCrashlyticsUserId(crashlytics, userId);
}
