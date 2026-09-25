import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Client Supabase dùng chung cho toàn bộ app (Auth + PostgREST).
 * `flowType: 'pkce'` để dùng được trên PWA standalone (không có state cookie).
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
