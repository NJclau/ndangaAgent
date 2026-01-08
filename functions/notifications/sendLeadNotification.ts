
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const sendLeadNotification = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    const lead = snap.data();
    const leadId = context.params.leadId;

    if (!lead) {
      console.log('No data associated with the event');
      return;
    }

    const userId = lead.userId; // Assuming you have a userId field in your lead document

    const userRef = db.doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    if (!userData) {
        console.log("User not found");
        return;
    }

    const { fcmToken, preferences } = userData;

    if (preferences && preferences.notifications === false) {
      console.log('User has disabled notifications');
      return;
    }

    if (!fcmToken) {
      console.log('No FCM token for user, cannot send notification');
      return;
    }

    const payload: admin.messaging.MessagingPayload = {
      notification: {
        title: '🎯 New High-Intent Lead',
        body: `${lead.author} is looking for ${lead.category} (${lead.confidence}% confidence)`,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        click_action: `/leads/${leadId}`
      },
      data: {
        leadId,
        url: `/leads/${leadId}`,
      },
    };

    try {
      await messaging.sendToDevice(fcmToken, payload);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  });
