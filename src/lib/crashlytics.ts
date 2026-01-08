
import { getCrashlytics, log, recordError, setUserId } from "firebase/crashlytics";
import { app } from "./firebase/config";

let crashlytics: any; // Use 'any' to avoid type issues

// Initialize Crashlytics only on the client side
if (typeof window !== 'undefined') {
    try {
        crashlytics = getCrashlytics(app);
    } catch (e) {
        console.error("Crashlytics initialization failed", e);
    }
}


/**
 * Logs a non-fatal error to Firebase Crashlytics.
 * @param error The error object to log.
 * @param context Additional context to include with the error report.
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (!crashlytics) return;

  // In a real app, you might add more context here
  // setCustomKey('some_key', 'some_value'); // Note: setCustomKey is not directly available on the crashlytics instance
  if (context) {
    // A common way to add context is to log it before the error
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
export function setCrashlyticsUser(userId: string | null) {
  if (!crashlytics) return;
  
  setUserId(crashlytics, userId || '');
}

/**
 * Logs a simple message to be included in Crashlytics reports as a breadcrumb.
 * @param message The message to log.
 */
export function addBreadcrumb(message: string) {
    if (!crashlytics) return;

    log(crashlytics, message);
}
