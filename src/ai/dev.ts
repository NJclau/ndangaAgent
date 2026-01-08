import { config } from 'dotenv';
config({path: '.env.local'});

import '@/ai/flows/automated-reply-generation.ts';
import '@/ai/flows/lead-confidence-scoring.ts';
