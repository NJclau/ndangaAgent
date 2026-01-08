import { logError } from '@/lib/crashlytics';
import { crashlytics } from './firebase/config';
import { logEvent as logAnalyticsEvent } from "firebase/analytics";
import { analytics } from "./firebase/config";

/**
 * Logs a non-fatal error to Firebase Crashlytics.
 * @param error The error object to log.
 * @param context Additional context to include with the error report.
 */
export async function logError(error: Error, context?: Record<string, any>) {
  const crashlyticsInstance = await crashlytics;
  if (!crashlyticsInstance) return;

  // In a real app, you might add more context here
  // crashlyticsInstance.setCustomKey('some_key', 'some_value');
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
        crashlyticsInstance.setCustomKey(key, String(value));
    });
  }
  
  crashlyticsInstance.recordError(error);
}

/**
 * Sets the user ID for Crashlytics sessions.
 * @param userId The unique identifier for the user.
 */
export async function setCrashlyticsUser(userId: string | null) {
  const crashlyticsInstance = await crashlytics;
  if (!crashlyticsInstance) return;
  
  crashlyticsInstance.setUserId(userId || '');
}

/**
 * Logs a simple message to be included in Crashlytics reports as a breadcrumb.
 * @param message The message to log.
 */
export async function addBreadcrumb(message: string) {
    const crashlyticsInstance = await crashlytics;
    if (!crashlyticsInstance) return;

    crashlyticsInstance.log(message);
}
