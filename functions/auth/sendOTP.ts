
/**
 * Prerequisities for this function to work:
 * 1. Enable the Identity Platform API in your Google Cloud project.
 * 2. Add your Firebase API key to the `API_KEY` variable.
 * 3. Make sure to install axios in your functions folder: `npm install axios`
 * 4. Deploy this function to Firebase Cloud Functions.
 */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

const db = admin.firestore();
// TODO: Replace with your Firebase Web API key
const API_KEY = 'your-firebase-api-key';

const RWANDA_PHONE_REGEX = /^\+250\d{9}$/;

export const sendOTP = functions.https.onCall(async (data, context) => {
  const { phone, recaptchaToken } = data;

  if (!phone || !RWANDA_PHONE_REGEX.test(phone)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid Rwandan phone number format. Use +250XXXXXXXXX.');
  }

  if (!recaptchaToken) {
    throw new functions.https.HttpsError('invalid-argument', 'Recaptcha token is required.');
  }

  const now = admin.firestore.Timestamp.now();
  const oneHourAgo = new admin.firestore.Timestamp(now.seconds - 3600, now.nanoseconds);

  const otpAttemptsRef = db.collection('otpAttempts');
  const query = otpAttemptsRef
    .where('phone', '==', phone)
    .where('timestamp', '>=', oneHourAgo);

  try {
    const snapshot = await query.get();

    if (snapshot.size >= 3) {
      return { success: false, message: 'Too many OTP requests. Please try again later.' };
    }

    // Send OTP using Identity Platform API
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v2/projects/${process.env.GCLOUD_PROJECT}/accounts:sendVerificationCode?key=${API_KEY}`,
      {
        phoneNumber: phone,
        recaptchaToken: recaptchaToken,
      }
    );

    const { sessionInfo } = response.data;

    // Save the attempt and sessionInfo to Firestore
    await otpAttemptsRef.add({
      phone,
      timestamp: now,
      sessionInfo,
    });

    return { success: true, message: 'OTP sent successfully.' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send OTP.');
  }
});
