
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, db } from '@/lib/firebase/config';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { doc, updateDoc } from 'firebase/firestore';

// This hook is responsible for managing Firebase Cloud Messaging (FCM)
export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || !user) {
      return;
    }
    
    // Dynamically get messaging to ensure it's client-side only
    const messaging = getMessaging(app);

    // 1. Request Permission
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');

        // 2. Get Token
        getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY })
          .then((currentToken) => {
            if (currentToken) {
              // 3. Save Token to Firestore
              console.log('FCM Token:', currentToken);
              const userRef = doc(db, 'users', user.uid);
              updateDoc(userRef, { fcmToken: currentToken });
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          })
          .catch((err) => {
            console.error('An error occurred while retrieving token. ', err);
            toast({
              variant: 'destructive',
              title: 'Could not get notification token',
              description: 'Please ensure your browser supports push notifications and try again.',
            });
          });
      } else {
        console.log('Unable to get permission to notify.');
      }
    });

    // 4. Handle Foreground Messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      toast({
        title: payload.notification?.title,
        description: payload.notification?.body,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [user, toast]);
}
