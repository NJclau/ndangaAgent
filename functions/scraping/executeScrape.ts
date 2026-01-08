
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { decrypt } from '../../utils/encryption'; // Assuming you have an encryption utility
import { InstagramEngine } from './engines/InstagramEngine';
import { TwitterEngine } from './engines/TwitterEngine';

const db = admin.firestore();
const pubsub = new PubSub();
const BAN_TOPIC = 'worker-banned';

export const executeScrape = functions.https.onRequest(async (req, res) => {
  const { targetId, workerId, platform, searchTerm } = req.body;

  try {
    const workerRef = db.collection('workers').doc(workerId);
    const workerDoc = await workerRef.get();

    if (!workerDoc.exists) {
      throw new Error(`Worker ${workerId} not found.`);
    }

    const worker = workerDoc.data()!;
    const credentials = JSON.parse(decrypt(worker.cookieBlob));

    let posts;
    if (platform === 'instagram') {
      posts = await InstagramEngine.scrape(searchTerm, credentials);
    } else if (platform === 'twitter') {
      posts = await TwitterEngine.scrape(searchTerm, credentials);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const batch = db.batch();
    posts.forEach(post => {
      const postRef = db.collection('rawPosts').doc(); // Auto-generate ID
      batch.set(postRef, post);
    });
    await batch.commit();

    await db.collection('targets').doc(targetId).update({ lastScanned: admin.firestore.FieldValue.serverTimestamp() });
    await workerRef.update({ status: 'idle' });

    res.status(200).send('Scrape successful');
  } catch (error: any) {
    console.error('Scrape failed:', error.message);

    if (error.message.includes('429') || error.message.includes('captcha')) {
      await db.collection('workers').doc(workerId).update({ status: 'banned', quarantinedUntil: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000) });
      await pubsub.topic(BAN_TOPIC).publish(Buffer.from(JSON.stringify({ workerId, reason: 'banned' })));
    }

    res.status(500).send('Scrape failed');
  }
});
