import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Lead } from '../../../types/firestore';

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (e) {
  // Ignore "app already exists" error
}

const db = admin.firestore();

export const onLeadCreate = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    const lead = snap.data() as Lead;
    const { userId } = lead;

    // Use a transaction to ensure atomic updates
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (userDoc.exists) {
        const userData = userDoc.data();
        const stats = userData.stats || {};
        const totalLeads = (stats.totalLeads || 0) + 1;
        const leadsContacted = stats.leadsContacted || 0;
        const conversionRate = totalLeads > 0 ? leadsContacted / totalLeads : 0;

        transaction.update(userRef, {
          'stats.totalLeads': totalLeads,
          'stats.conversionRate': conversionRate
        });
      }
    });


    // Increment leadsFound in the relevant target if targetId is present
    if (lead.targetId) {
      const targetRef = db.collection('targets').doc(lead.targetId);
      await targetRef.update({
        leadsFound: admin.firestore.FieldValue.increment(1)
      });
    }
  });

export const onLeadUpdate = functions.firestore
  .document('leads/{leadId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data() as Lead;
    const after = change.after.data() as Lead;

    // Check if the status has changed to 'contacted' or 'dismissed'
    if (before.status !== after.status) {
      const { userId } = after;
      const userRef = db.collection('users').doc(userId);

      // Use a transaction to ensure atomic updates
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists) {
          const userData = userDoc.data();
          const stats = userData.stats || {};
          let { leadsContacted = 0, leadsDismissed = 0, totalLeads = 0 } = stats;

          // Increment the appropriate counter
          if (after.status === 'contacted') {
            leadsContacted++;
          } else if (after.status === 'dismissed') {
            leadsDismissed++;
          }

          // Recalculate conversion rate
          const conversionRate = totalLeads > 0 ? leadsContacted / totalLeads : 0;

          transaction.update(userRef, {
            'stats.leadsContacted': leadsContacted,
            'stats.leadsDismissed': leadsDismissed,
            'stats.conversionRate': conversionRate
          });
        }
      });
    }
  });
