import { z } from 'zod';

export const EventSchema = z.object({
  event_id: z.string().startsWith('evt_'),
  event_name: z.string().max(128),
  category: z.enum(['navigation', 'feature', 'session', 'performance', 'error', 'business', 'system', 'user', 'custom']),
  distinct_id: z.string().max(255),
  project_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  properties: z.record(z.any()).optional(),
  properties_num: z.record(z.number()).optional(),
  context: z.object({
    url: z.string().optional(),
    referrer: z.string().optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
    session_id: z.string().optional()
  }).optional()
});

export const SessionSchema = z.object({
  session_id: z.string(),
  user_id: z.string().optional(),
  project_id: z.string().uuid(),
  started_at: z.string().datetime(),
  last_activity_at: z.string().datetime(),
  is_active: z.boolean().default(true)
});

export const IdentifySchema = z.object({
  anonymous_id: z.string().startsWith('anon_'),
  identified_id: z.string(),
  project_id: z.string().uuid(),
  traits: z.record(z.any()).optional()
});

export const TrackSchema = z.object({
  event_name: z.string().max(128),
  project_id: z.string().uuid(),
  properties: z.record(z.any()).optional()
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional()
});
