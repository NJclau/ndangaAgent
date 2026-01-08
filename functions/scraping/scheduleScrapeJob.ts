
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { CloudTasksClient } from '@google-cloud/tasks';

const db = admin.firestore();
const tasksClient = new CloudTasksClient();

const PROJECT_ID = process.env.GCLOUD_PROJECT || '';
const LOCATION = 'us-central1'; // Or your desired location
const QUEUE = 'scrape-queue'; // The name of your Cloud Tasks queue

export const scheduleScrapeJob = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  const targetsSnapshot = await db.collection('targets').where('active', '==', true).get();

  for (const doc of targetsSnapshot.docs) {
    const target = doc.data();
    const targetId = doc.id;

    try {
      const workerId = await db.runTransaction(async (transaction) => {
        const workersQuery = db.collection('workers').where('status', '==', 'idle').limit(1);
        const workerSnapshot = await transaction.get(workersQuery);

        if (workerSnapshot.empty) {
          console.warn('No idle workers available.');
          return null;
        }

        const workerDoc = workerSnapshot.docs[0];
        transaction.update(workerDoc.ref, { status: 'busy' });
        return workerDoc.id;
      });

      if (workerId) {
        const task = {
          httpRequest: {
            httpMethod: 'POST' as const,
            url: `https://${LOCATION}-${PROJECT_ID}.cloudfunctions.net/executeScrape`,
            body: Buffer.from(JSON.stringify({ targetId, workerId, platform: target.platform, searchTerm: target.searchTerm })).toString('base64'),
            headers: {
              'Content-Type': 'application/json',
            },
          },
          scheduleTime: {
            seconds: Date.now() / 1000 + 10, // Schedule 10 seconds in the future
          },
        };

        const parent = tasksClient.queuePath(PROJECT_ID, LOCATION, QUEUE);
        await tasksClient.createTask({ parent, task });
        console.log(`Task created for target ${targetId} and worker ${workerId}`);
      }
    } catch (error) {
      console.error(`Failed to schedule job for target ${targetId}:`, error);
    }
  }
});
