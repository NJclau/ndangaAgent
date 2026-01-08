
import { logEvent, getAnalytics, isSupported } from "firebase/analytics";
import { app } from "./firebase/config";

let analytics: any; // Use 'any' to avoid type issues before initialization

isSupported().then(supported => {
    if (supported && typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
});


export const logLogin = (method: string) => {
    if (analytics) {
        logEvent(analytics, 'login', { method });
    }
};

export const logSignUp = (method: string) => {
    if (analytics) {
        logEvent(analytics, 'sign_up', { method });
    }
};

export const logLeadContacted = (leadId: string, confidence: number, platform: string) => {
    if (analytics) {
        logEvent(analytics, 'lead_contacted', { leadId, confidence, platform });
    }
}

export const logLeadDismissed = (leadId: string, confidence: number) => {
    if (analytics) {
        logEvent(analytics, 'lead_dismissed', { leadId, confidence });
    }
}

export const logTargetAdded = (platform: string, type: string) => {
    if (analytics) {
        logEvent(analytics, 'target_added', { platform, type });
    }
}
