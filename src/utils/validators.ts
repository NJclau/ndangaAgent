
import { z } from 'zod';

export const LeadDataSchema = z.object({
  is_lead: z.boolean(),
  confidence_score: z.number().min(0).max(100),
  reason: z.string(),
  draft_reply: z.string(),
});

export const RawPostSchema = z.object({
  postId: z.string(),
  text: z.string(),
  platform: z.string(),
  authorHandle: z.string(),
  timestamp: z.any(),
});
