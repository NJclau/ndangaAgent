
import { getMessaging } from 'firebase/messaging';
import { app } from '@/lib/firebase/config';

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = (typeof window !== 'undefined') ? getMessaging(app) : undefined;
