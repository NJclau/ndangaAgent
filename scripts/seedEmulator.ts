import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

async function seedData() {
  const db = getFirestore();
  
  // Create test user
  await addDoc(collection(db, 'users'), {
    id: 'test_user_1',
    name: 'Grace M.',
    phone: '+250780000000',
    businessName: 'Grace Plumbing Services',
    businessCategory: 'Plumbing',
    keywords: ['plumber', 'fundi', '#KigaliPlumber'],
    plan: 'pro',
    credits: 450,
    createdAt: new Date()
  });
  
  // Create test leads
  await addDoc(collection(db, 'leads'), {
    userId: 'test_user_1',
    platform: 'twitter',
    postId: 'tweet_123',
    text: 'Ninde uzi fundi mwiza mu mujyi? Ndashaka umutekinisiye.',
    author: 'Test User',
    authorHandle: '@test_rw',
    timestamp: new Date(),
    confidence: 92,
    reason: 'User explicitly asking for technician',
    draftReply: 'Hello! I am a professional plumber...',
    status: 'new',
    tags: ['Plumbing', 'Urgent'],
    createdAt: new Date()
  });
}

seedData();