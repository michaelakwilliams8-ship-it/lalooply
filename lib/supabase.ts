import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 10;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Loop {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  likes_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}
