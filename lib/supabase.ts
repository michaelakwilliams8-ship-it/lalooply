import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  coins: number;
  created_at: string;
};

export type Survey = {
  id: string;
  area: string;
  questions: string[];
  asker_id: string;
  asker_name: string;
  created_at: string;
};

export type Answer = {
  id: string;
  survey_id: string;
  responder_id: string;
  responder_name: string;
  responses: string[];
  created_at: string;
};
