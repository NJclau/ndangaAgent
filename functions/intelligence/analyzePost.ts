
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { analyzePostWithGemini } from '../../utils/geminiClient';
import { RawPostSchema } from '../../utils/validators';

admin.initializeApp();

const db = admin.firestore();

const MAX_RETRIES = 3;

// This function is triggered when a new document is created in the rawPosts collection.
// It analyzes the post for lead potential using the Gemini API.
export const analyzePost = functions.firestore
  .document('rawPosts/{postId}')
  .onCreate(async (snap, context) => {
    // The following line is commented out but shows how you could get the user's business category.
    // const userId = snap.data().userId;
    // const user = await db.collection('users').doc(userId).get();
    // const businessCategory = user.data()?.businessCategory || 'general';
    const businessCategory = 'general'; // Using a default for now

    const postData = snap.data();
    const validationResult = RawPostSchema.safeParse(postData);

    if (!validationResult.success) {
      functions.logger.error('Invalid post data:', validationResult.error.message);
      await db.collection('failedAnalysis').add({ ...postData, error: 'Invalid post data' });
      return;
    }

    // Exponential backoff for retries
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // Caching logic would go here. For example, you could check if a similar post has been analyzed before.

        const analysis = await analyzePostWithGemini(validationResult.data, businessCategory);

        if (analysis.is_lead && analysis.confidence_score >= 50) {
          await db.collection('leads').add({
            ...validationResult.data,
            confidence: analysis.confidence_score,
            reason: analysis.reason,
            draftReply: analysis.draft_reply,
            status: 'new',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Trigger notification
          // This assumes you have a function named 'sendLeadNotification'
          // await admin.messaging().sendToTopic('new_leads', { ... });
        }

        return; // Success, exit the loop
      } catch (error: any) {
        functions.logger.error(`Attempt ${i + 1} failed:`, error.message);
        if (i === MAX_RETRIES - 1) {
          await db.collection('failedAnalysis').add({ ...postData, error: error.message });
        }
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  });

/*
* To implement batch processing, you would typically use a Pub/Sub triggered function.
* You could have a cron job that collects posts and sends them to a Pub/Sub topic in a batch.
* The Pub/Sub function would then receive the batch and process them in parallel.
*
* For cost control with a circuit breaker, you could use a library like 'opossum'
* to wrap the Gemini API call. This would prevent the function from making further calls
* if the API is returning errors or if the cost exceeds a certain threshold.
*/
