
'use client';

import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/utils/fcm';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const useNotifications = (userId: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!messaging) return;

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      await generateToken();
    }
  };

  const generateToken = async () => {
    if (!messaging) return;

    try {
      const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (fcmToken) {
        setToken(fcmToken);
        // Save the token to Firestore
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { fcmToken }, { merge: true });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
    }
  };

  useEffect(() => {
    if (notificationPermission === 'granted') {
      generateToken();
    }

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // Customize notification handling here
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: payload.notification?.icon,
        });
      });

      return () => unsubscribe();
    }
  }, [notificationPermission, userId]);

  return { token, notificationPermission, requestPermission };
};
