
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const updateLeadStatus = functions.https.onCall(async (data, context) => {
  const { leadId, status } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to update a lead.');
  }

  if (!leadId || !status) {
    throw new functions.https.HttpsError('invalid-argument', 'leadId and status are required.');
  }

  try {
    await db.collection('leads').doc(leadId).update({ status });
    return { success: true, message: `Lead ${leadId} updated to ${status}` };
  } catch (error) { 
    console.error(`Error updating lead ${leadId}:`, error);
    throw new functions.https.HttpsError('internal', 'Could not update lead status.');
  }
});
