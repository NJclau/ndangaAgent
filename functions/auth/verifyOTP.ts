
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();

// TODO: Replace with your Firebase Web API key
const API_KEY = 'your-firebase-api-key';

export const verifyOTP = functions.https.onCall(async (data, context) => {
  const { phone, code } = data;

  if (!phone || !code) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number and code are required.');
  }

  try {
    const otpAttemptsRef = db.collection('otpAttempts');
    const query = otpAttemptsRef
      .where('phone', '==', phone)
      .orderBy('timestamp', 'desc')
      .limit(1);

    const snapshot = await query.get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'No OTP attempt found for this number.');
    }

    const lastAttempt = snapshot.docs[0].data();
    const { sessionInfo } = lastAttempt;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v2/projects/${process.env.GCLOUD_PROJECT}/accounts:signInWithPhoneNumber?key=${API_KEY}`,
      {
        sessionInfo: sessionInfo,
        code: code,
      }
    );

    const { idToken, localId } = response.data;

    const userRef = db.collection('users').doc(localId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        id: localId,
        phone: phone,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const customToken = await admin.auth().createCustomToken(localId);

    return { token: customToken, userId: localId };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to verify OTP.');
  }
});
