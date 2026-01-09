// functions/src/scraping/executeScrape.ts

import * as functions from 'firebase-functions/v2/pubsub';
import * as admin from 'firebase-admin';
import { decrypt } from '../utils/encryption';
import { InstagramScraper } from './scrapers/InstagramScraper';
import { TwitterScraper } from './scrapers/TwitterScraper';

export const executeScrape = functions.onMessagePublished(
  {
    topic: 'scrape-jobs',
    region: 'us-central1',
    memory: '512MiB', // Puppeteer needs more memory
    timeoutSeconds: 60
  },
  async (event) => {
    const jobData = JSON.parse(
      Buffer.from(event.data.message.data, 'base64').toString()
    );

    const { targetId, workerId, platform, term } = jobData;

    try {
      // Get worker credentials
      const workerDoc = await admin.firestore()
        .collection('workers')
        .doc(workerId)
        .get();

      if (!workerDoc.exists) {
        throw new Error(`Worker ${workerId} not found`);
      }

      const worker = workerDoc.data()!;
      const credentials = JSON.parse(
        decrypt(worker.cookieBlobEncrypted)
      );

      // Execute scrape based on platform
      let posts: any[] = [];

      if (platform === 'instagram') {
        const scraper = new InstagramScraper(credentials);
        posts = await scraper.scrapeHashtag(term);
      } else if (platform === 'twitter') {
        const scraper = new TwitterScraper(credentials);
        posts = await scraper.searchKeyword(term);
      }

      console.log(`Scraped ${posts.length} posts for target ${targetId}`);

      // Store raw posts in Firestore
      const batch = admin.firestore().batch();

      for (const post of posts) {
        const postRef = admin.firestore()
          .collection('rawPosts')
          .doc(`${platform}_${post.id}`);

        batch.set(postRef, {
          platform: platform,
          postId: post.id,
          text: post.text,
          authorHandle: post.author,
          payload: post,
          processed: false,
          scrapedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true }); // Avoid duplicates
      }

      await batch.commit();

      // Release worker
      await admin.firestore()
        .collection('workers')
        .doc(workerId)
        .update({
          status: 'idle',
          requestsToday: admin.firestore.FieldValue.increment(posts.length)
        });

      // Update target metrics
      await admin.firestore()
        .collection('targets')
        .doc(targetId)
        .update({
          lastScrapedAt: admin.firestore.FieldValue.serverTimestamp()
        });

    } catch (error: any) {
      console.error(`Scrape failed for target ${targetId}:`, error);

      // Handle rate limiting / ban detection
      if (error.message.includes('429') ||
          error.message.includes('captcha') ||
          error.message.includes('rate limit')) {

        await admin.firestore()
          .collection('workers')
          .doc(workerId)
          .update({
            status: 'banned',
            banReason: error.message,
            bannedAt: admin.firestore.FieldValue.serverTimestamp(),
            quarantineUntil: new admin.firestore.Timestamp(
              Math.floor(Date.now() / 1000) + 86400, 0 // 24 hours
            )
          });

        console.log(`Worker ${workerId} quarantined for 24 hours`);
      } else {
        // Release worker for other errors
        await admin.firestore()
          .collection('workers')
          .doc(workerId)
          .update({ status: 'idle' });
      }
    }
  }
);