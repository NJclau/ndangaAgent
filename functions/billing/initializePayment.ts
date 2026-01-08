
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { requestToPay } from '../utils/mtnMomoClient';

const db = admin.firestore();

export const initializePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to make a payment.');
  }

  const { userId, plan, amount, phoneNumber } = data;

  if (userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You can only make payments for your own account.');
  }

  try {
    const { referenceId, status } = await requestToPay(amount, 'EUR', phoneNumber, `Payment for ${plan} plan`);

    if (status === 202) {
      await db.collection('payments').doc(referenceId).set({
        userId,
        plan,
        amount,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { referenceId };
    } else {
      throw new functions.https.HttpsError('internal', 'Failed to initiate payment.');
    }
  } catch (error) {
    console.error("Error initializing payment: ", error);
    throw new functions.https.HttpsError('internal', 'Could not initialize payment.');
  }
});
