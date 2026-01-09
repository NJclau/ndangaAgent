// functions/src/scraping/scheduleScrapeJobs.ts

import * as functions from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

export const scheduleScrapeJobs = functions.onSchedule(
  {
    schedule: 'every 30 minutes',
    timeZone: 'Africa/Kigali',
    region: 'us-central1',
    memory: '128MiB'
  },
  async () => {
    const db = getFirestore();
    const now = admin.firestore.Timestamp.now();

    // Get all active targets due for scraping
    const targetsSnapshot = await db.collection('targets')
      .where('status', '==', 'active')
      .where('nextScrapeAt', '<=', now)
      .limit(50) // Process max 50 per run
      .get();

    if (targetsSnapshot.empty) {
      console.log('No targets due for scraping');
      return;
    }

    console.log(`Found ${targetsSnapshot.size} targets to scrape`);

    // Process each target
    for (const targetDoc of targetsSnapshot.docs) {
      const target = targetDoc.data();

      try {
        // Reserve an idle worker
        const workerId = await reserveWorker(target.platform);

        if (!workerId) {
          console.log(`No available workers for ${target.platform}`);
          continue;
        }

        // Queue scrape job via Pub/Sub
        await pubsub.topic('scrape-jobs').publish(
          Buffer.from(JSON.stringify({
            targetId: targetDoc.id,
            workerId: workerId,
            platform: target.platform,
            type: target.type,
            term: target.term,
            scheduledAt: now.toMillis()
          }))
        );

        // Update next scrape time (30 min intervals)
        await targetDoc.ref.update({
          nextScrapeAt: new admin.firestore.Timestamp(
            now.seconds + 1800, 0 // 30 minutes
          )
        });

        console.log(`Queued scrape job for target ${targetDoc.id}`);

      } catch (error) {
        console.error(`Failed to queue scrape for ${targetDoc.id}:`, error);
      }
    }
  }
);

async function reserveWorker(platform: string): Promise<string | null> {
  const db = getFirestore();

  return db.runTransaction(async (transaction) => {
    // Find idle worker not banned or quarantined
    const workersQuery = db.collection('workers')
      .where('platform', '==', platform)
      .where('status', '==', 'idle')
      .limit(1);

    const workersSnapshot = await transaction.get(workersQuery);

    if (workersSnapshot.empty) {
      return null;
    }

    const workerDoc = workersSnapshot.docs[0];
    const workerId = workerDoc.id;

    // Mark as busy
    transaction.update(workerDoc.ref, {
      status: 'busy',
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return workerId;
  });
}