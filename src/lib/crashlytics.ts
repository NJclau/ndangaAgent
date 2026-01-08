
import { app } from "./firebase/config";

let crashlyticsInstance: any = null;

const getCrashlyticsInstance = async () => {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!crashlyticsInstance) {
    const { getCrashlytics } = await import("firebase/crashlytics");
    try {
        crashlyticsInstance = getCrashlytics(app);
    } catch (e) {
        console.error("Crashlytics initialization failed", e);
    }
  }
  return crashlyticsInstance;
}


/**
 * Logs a non-fatal error to Firebase Crashlytics.
 * @param error The error object to log.
 * @param context Additional context to include with the error report.
 */
export async function logError(error: Error, context?: Record<string, any>) {
  const crashlytics = await getCrashlyticsInstance();
  if (!crashlytics) return;

  const { log, recordError } = await import("firebase/crashlytics");

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
        log(crashlytics, `${key}: ${String(value)}`);
    });
  }
  
  recordError(crashlytics, error);
}

/**
 * Sets the user ID for Crashlytics sessions.
 * @param userId The unique identifier for the user.
 */
export async function setCrashlyticsUser(userId: string | null) {
  const crashlytics = await getCrashlyticsInstance();
  if (!crashlytics) return;
  
  const { setUserId } = await import("firebase/crashlytics");
  setUserId(crashlytics, userId || '');
}

/**
 * Logs a simple message to be included in Crashlytics reports as a breadcrumb.
 * @param message The message to log.
 */
export async function addBreadcrumb(message: string) {
    const crashlytics = await getCrashlyticsInstance();
    if (!crashlytics) return;

    const { log } = await import("firebase/crashlytics");
    log(crashlytics, message);
}
