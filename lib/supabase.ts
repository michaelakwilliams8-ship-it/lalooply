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

export interface Profile {
  id: string;
  name: string;
  coins: number;
  created_at: string;
}

export interface Survey {
  id: string;
  area: string;
  questions: string[];
  asker_id: string;
  asker_name: string;
  created_at: string;
}

export interface Answer {
  id: string;
  survey_id: string;
  responder_id: string;
  responder_name: string;
  responses: string[];
  created_at: string;
}
