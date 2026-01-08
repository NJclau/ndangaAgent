import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase/config";

export const logLogin = async (method: string) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
        logEvent(analyticsInstance, 'login', { method });
    }
};

export const logSignUp = async (method: string) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_up', { method });
    }
};

export const logLeadContacted = async (leadId: string, confidence: number, platform: string) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
        logEvent(analyticsInstance, 'lead_contacted', { leadId, confidence, platform });
    }
}

export const logLeadDismissed = async (leadId: string, confidence: number) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
        logEvent(analyticsInstance, 'lead_dismissed', { leadId, confidence });
    }
}

export const logTargetAdded = async (platform: string, type: string) => {
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
        logEvent(analyticsInstance, 'target_added', { platform, type });
    }
}
