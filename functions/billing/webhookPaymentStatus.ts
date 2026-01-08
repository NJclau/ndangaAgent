
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const db = admin.firestore();

// TODO: Store this securely in environment variables
const MOMO_API_SECRET = functions.config().mtn.collection_api_secret;

export const webhookPaymentStatus = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['x-mtn-signature'] as string;

  // Verify the HMAC signature to ensure the request is from MTN
  const hmac = crypto.createHmac('sha256', MOMO_API_SECRET);
  hmac.update(JSON.stringify(req.body));
  const expectedSignature = hmac.digest('hex');

  if (signature !== expectedSignature) {
    console.error("Invalid webhook signature.");
    res.status(401).send('Invalid signature');
    return;
  }

  const { externalId, status } = req.body;

  try {
    const paymentRef = db.collection('payments').doc(externalId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      res.status(404).send('Payment not found');
      return;
    }

    await paymentRef.update({ status });

    if (status === 'SUCCESSFUL') {
      const { userId, plan, amount } = paymentDoc.data() as any;
      const userRef = db.collection('users').doc(userId);

      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw "User not found!";
        }

        const newCredits = (userDoc.data()?.credits || 0) + (amount * 10); // Example: 1 EUR = 10 credits
        transaction.update(userRef, { plan, credits: newCredits });
      });

      // TODO: Send confirmation email via SendGrid
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error("Error processing webhook: ", error);
    res.status(500).send('Internal server error');
  }
});
