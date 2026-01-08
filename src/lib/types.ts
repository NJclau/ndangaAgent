export type UserProfile = {
  id: string;
  name?: string;
  phone: string;
  businessName?: string;
  businessCategory?: string;
  keywords?: string[];
  plan?: 'free' | 'pro' | 'enterprise';
  credits?: number;
  createdAt: Date;
  fcmToken?: string;
};

export type Lead = {
  id: string;
  userId: string;
  platform: 'twitter' | 'reddit' | 'linkedin';
  postId: string;
  text: string;
  author: string;
  authorHandle: string;
  timestamp: Date;
  confidence: number;
  reason: string;
  draftReply?: string;
  status: 'pending' | 'replied' | 'ignored';
  tags?: string[];
  createdAt: Date;
};

export type Target = {
  id: string;
  userId: string;
  platform: 'twitter' | 'reddit' | 'linkedin';
  type: 'keyword' | 'hashtag' | 'account';
  term: string;
  status: 'active' | 'paused';
  leadsFound: number;
  lastScanned: Date;
  createdAt: Date;
};

export type Activity = {
  id: string;
  userId: string;
  leadId: string;
  actionType: 'replied' | 'ignored' | 'generated_reply';
  timestamp: Date;
};
