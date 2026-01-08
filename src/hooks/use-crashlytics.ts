'use client';

import { app } from "@/lib/firebase/config";
import { useCallback, useEffect, useState } from "react";
import type { Crashlytics } from 'firebase/crashlytics';

type CrashlyticsModule = typeof import('firebase/crashlytics');

let crashlyticsInstance: Crashlytics | null = null;
let crashlyticsModule: CrashlyticsModule | null = null;

async function getCrashlyticsModules() {
    if (typeof window === 'undefined') {
        return { crashlyticsInstance: null, crashlyticsModule: null };
    }
    
    if (!crashlyticsModule) {
        crashlyticsModule = await import('firebase/crashlytics');
    }
    
    if (!crashlyticsInstance && crashlyticsModule) {
        try {
            crashlyticsInstance = crashlyticsModule.getCrashlytics(app);
        } catch(e) {
            console.error("Crashlytics initialization failed", e);
        }
    }

    return { crashlyticsInstance, crashlyticsModule };
}


export function useCrashlytics() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        getCrashlyticsModules().then(({ crashlyticsInstance }) => {
            if (crashlyticsInstance) {
                setIsInitialized(true);
            }
        });
    }, []);

    const logError = useCallback(async (error: Error, context?: Record<string, any>) => {
        const { crashlyticsInstance, crashlyticsModule } = await getCrashlyticsModules();
        if (!crashlyticsInstance || !crashlyticsModule) return;

        if (context) {
            Object.entries(context).forEach(([key, value]) => {
                crashlyticsModule.log(crashlyticsInstance, `${key}: ${String(value)}`);
            });
        }
        crashlyticsModule.recordError(crashlyticsInstance, error);
    }, []);

    const setCrashlyticsUser = useCallback(async (userId: string | null) => {
        const { crashlyticsInstance, crashlyticsModule } = await getCrashlyticsModules();
        if (!crashlyticsInstance || !crashlyticsModule) return;
        
        crashlyticsModule.setUserId(crashlyticsInstance, userId || '');
    }, []);

    const addBreadcrumb = useCallback(async (message: string) => {
        const { crashlyticsInstance, crashlyticsModule } = await getCrashlyticsModules();
        if (!crashlyticsInstance || !crashlyticsModule) return;

        crashlyticsModule.log(crashlyticsInstance, message);
    }, []);
    
    return { logError, setCrashlyticsUser, addBreadcrumb, isInitialized };
}
