import { Timestamp } from 'firebase/firestore';

// 1. users (Root Collection)
export interface User {
  // Identity
  id: string;                    // Same as document ID
  phone: string;                 // E.164 format: +250780000000
  name: string;                  // Display name
  businessName: string;          // "Grace Plumbing Services"
  businessCategory: string;      // "Plumbing" | "IT Support" | etc.

  // Subscription
  plan: "free" | "pro" | "enterprise";
  credits: number;               // Remaining action credits
  creditsUsedToday: number;      // Reset daily via Cloud Scheduler

  // Configuration
  keywords: string[];            // ["plumber", "fundi", "#KigaliPlumber"]
  language: "en" | "rw" | "fr";  // Default: "en"
  timezone: string;              // "Africa/Kigali"

  // Engagement
  notificationsEnabled: boolean;
  fcmToken: string | null;       // Firebase Cloud Messaging token
  lastActiveAt: Timestamp;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isAdmin?: boolean;

  // Denormalized stats
  stats: {
    totalLeads: number;
    leadsContacted: number;
    leadsDismissed: number;
    conversionRate: number;      // Calculated: contacted / total
  };
}

// 2. leads (Root Collection)
export interface Lead {
  id: string;
  userId: string;
  targetId?: string; // Optional: The ID of the target that generated this lead

  // Source data
  platform: "instagram" | "twitter";
  postId: string;
  postUrl: string;
  text: string;

  // Author info
  author: string;
  authorHandle: string;
  authorAvatarUrl: string | null;

  // Intelligence
  confidence: number;
  reason: string;
  draftReply: string;
  tags: string[];

  // Status
  status: "new" | "contacted" | "dismissed";
  actedAt: Timestamp | null;

  // Timestamps
  timestamp: Timestamp;
  scrapedAt: Timestamp;
  createdAt: Timestamp;
}

// 3. targets (Root Collection)
export interface Target {
  id: string;
  userId: string;

  platform: "instagram" | "twitter";
  type: "hashtag" | "keyword" | "username";
  term: string;

  status: "active" | "paused";

  // Performance metrics
  leadsFound: number;
  lastScrapedAt: Timestamp | null;
  nextScrapeAt: Timestamp;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 4. workers (Root Collection - ADMIN ONLY ACCESS)
export interface Worker {
  id: string;
  platform: "instagram" | "twitter";
  username: string;

  // Credentials (encrypted)
  cookieBlobEncrypted: string;

  // Status tracking
  status: "idle" | "busy" | "banned" | "quarantined";
  currentTaskId: string | null;

  // Rate limiting
  requestsToday: number;
  lastUsedAt: Timestamp | null;

  // Ban management
  banReason: string | null;
  bannedAt: Timestamp | null;
  quarantineUntil: Timestamp | null;

  // Metadata
  createdAt: Timestamp;
  lastHealthCheckAt: Timestamp;
}

// 5. rawPosts (Root Collection - Temporary Storage)
export interface RawPost {
  platform: string;
  postId: string;
  payload: object;
  processed: boolean;
  scrapedAt: Timestamp;
}

// 6. actions (Subcollection under users/{userId}/actions)
export interface Action {
  id: string;
  leadId: string;
  actionType: "send" | "dismiss" | "edit_reply";
  replyText: string | null;
  timestamp: Timestamp;
}

// 7. subscriptions (Root Collection)
export interface Subscription {
  userId: string;
  plan: "free" | "pro" | "enterprise";

  // Payment
  paymentMethod: "mtn_momo" | "airtel_money" | "stripe";
  paymentPhone: string | null;

  // Billing cycle
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  autoRenew: boolean;

  // History
  lastPaymentAmount: number;
  lastPaymentDate: Timestamp | null;
  lifetimeValue: number;

  // Status
  status: "active" | "past_due" | "canceled";
  canceledAt: Timestamp | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 8. payments (Root Collection)
export interface Payment {
  id: string;
  userId: string;

  // Transaction details
  amount: number;
  currency: "RWF";
  plan: string;

  // Payment provider
  provider: "mtn_momo" | "airtel_money";
  providerTransactionId: string;

  // Status
  status: "pending" | "completed" | "failed" | "refunded";

  // Metadata
  initiatedAt: Timestamp;
  completedAt: Timestamp | null;
  failureReason: string | null;
}

// 9. systemMetrics (Root Collection - Single Document: "current")
export interface SystemMetrics {
  date: string;

  // Quota usage
  firestoreReads: number;
  firestoreWrites: number;
  firestoreDeletes: number;
  functionInvocations: number;
  authVerifications: number;

  // Performance
  avgFunctionDuration: number;
  avgFirestoreLatency: number;

  // Business metrics
  activeUsers: number;
  leadsGenerated: number;
  actionsPerformed: number;

  lastUpdated: Timestamp;
}
