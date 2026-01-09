
import * as functions from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

admin.initializeApp();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzePost = functions.onDocumentCreated(
  {
    document: 'rawPosts/{postId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
    maxInstances: 10 // Free tier friendly
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const { platform, postId, payload, text, authorHandle } = data;

    // Check if already processed
    if (data.processed) {
      console.log(`Post ${postId} already processed`);
      return;
    }

    try {
      // Find matching target keywords
      const targetsSnapshot = await admin.firestore()
        .collection('targets')
        .where('status', '==', 'active')
        .where('platform', '==', platform)
        .get();

      const matchingTargets = targetsSnapshot.docs.filter(doc => {
        const target = doc.data();
        const term = target.term.toLowerCase();
        const postText = text.toLowerCase();

        return postText.includes(term);
      });

      if (matchingTargets.length === 0) {
        // No matching targets, mark as processed
        await snapshot.ref.update({ processed: true });
        return;
      }

      // Get user context from the first matching target.
      // Assumption: all targets found in a single post belong to the same user.
      const userId = matchingTargets[0].data().userId;
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.data();

      // Analyze with Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt = `
Analyze this social media post for commercial intent to BUY or HIRE services.

Context:
- User sells: ${userData?.businessCategory || 'services'}
- Location: Kigali, Rwanda
- Languages: Kinyarwanda, English, French (code-switching common)

Post text: "${text}"

Return ONLY valid JSON with this exact structure:
{
  "is_lead": boolean,
  "confidence_score": number (0-100),
  "reason": string (max 100 chars),
  "draft_reply": string (max 200 chars, professional tone)
}

Criteria for is_lead=true:
- User explicitly asks for service/product
- User expresses problem that business can solve
- User requests recommendations
- Clear buying/hiring intent

Return is_lead=false for:
- General comments
- Appreciation posts
- News/information sharing
- Off-topic content
`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // Parse JSON response
      let analysis;
      try {
        // Remove markdown code blocks if present
        const cleanText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        analysis = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', responseText);
        throw new Error('Invalid JSON response from AI');
      }

      // Validate response structure
      if (typeof analysis.is_lead !== 'boolean' ||
          typeof analysis.confidence_score !== 'number' ||
          typeof analysis.reason !== 'string' ||
          typeof analysis.draft_reply !== 'string') {
        throw new Error('Invalid response structure');
      }

      // Only create lead if confidence >= 50%
      if (analysis.is_lead && analysis.confidence_score >= 50) {
        const leadId = admin.firestore().collection('leads').doc().id;

        await admin.firestore()
          .collection('leads')
          .doc(leadId)
          .set({
            id: leadId,
            userId: userId,
            platform: platform,
            postId: postId,
            postUrl: payload.url || '',
            text: text,
            author: payload.author || 'Unknown',
            authorHandle: authorHandle,
            authorAvatarUrl: payload.avatar || null,
            confidence: analysis.confidence_score,
            reason: analysis.reason,
            draftReply: analysis.draft_reply,
            tags: matchingTargets.map(t => t.data().term),
            status: 'new',
            actedAt: null,
            timestamp: payload.timestamp || admin.firestore.FieldValue.serverTimestamp(),
            scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

        // Update user stats (denormalized)
        await admin.firestore()
          .collection('users')
          .doc(userId)
          .update({
            'stats.totalLeads': admin.firestore.FieldValue.increment(1)
          });

        // Update target stats
        for (const targetDoc of matchingTargets) {
          await targetDoc.ref.update({
            leadsFound: admin.firestore.FieldValue.increment(1)
          });
        }

        // Send notification if enabled
        if (userData?.notificationsEnabled && userData?.fcmToken) {
          await admin.messaging().send({
            token: userData.fcmToken,
            notification: {
              title: '🎯 New High-Intent Lead',
              body: `${payload.author} (${analysis.confidence_score}% confidence)`
            },
            data: {
              leadId: leadId,
              url: `/leads/${leadId}`
            }
          });
        }

        // Track metrics
        await admin.firestore()
          .collection('systemMetrics')
          .doc('current')
          .update({
            leadsGenerated: admin.firestore.FieldValue.increment(1)
          });
      }

      // Mark as processed
      await snapshot.ref.update({ processed: true });

    } catch (error: any) {
      console.error('Analysis failed:', error);

      // Store failed analysis for manual review
      await admin.firestore()
        .collection('failedAnalysis')
        .add({
          postId: postId,
          platform: platform,
          text: text,
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }
  }
);
