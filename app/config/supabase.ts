/**
 * Supabase Client Configuration
 *
 * This module initializes and exports the Supabase client for use throughout the application.
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * Usage:
 * ```ts
 * import { supabase } from '~/config/supabase';
 *
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

/**
 * Supabase client instance
 *
 * Configured with:
 * - Auto-refresh of auth tokens
 * - Persistent sessions in localStorage
 * - Global headers for all requests
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Database type definitions
 * These will be auto-generated once you run `supabase gen types typescript`
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'user' | 'admin';
          created_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          created_at: string;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          created_at?: string;
          last_used_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
          created_at?: string;
          last_used_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          type: 'SLOT_PROPOSAL' | 'SLOT_AVAILABLE' | 'SLOT_CANCELLED';
          status: 'UNREAD' | 'READ' | 'ACCEPTED' | 'REFUSED';
          slot_date: string;
          slot_time_start: string;
          slot_time_end: string;
          slot_location: string;
          slot_description: string | null;
          sent_at: string;
          sent_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: 'SLOT_PROPOSAL' | 'SLOT_AVAILABLE' | 'SLOT_CANCELLED';
          status?: 'UNREAD' | 'READ' | 'ACCEPTED' | 'REFUSED';
          slot_date: string;
          slot_time_start: string;
          slot_time_end: string;
          slot_location: string;
          slot_description?: string | null;
          sent_at?: string;
          sent_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: 'SLOT_PROPOSAL' | 'SLOT_AVAILABLE' | 'SLOT_CANCELLED';
          status?: 'UNREAD' | 'READ' | 'ACCEPTED' | 'REFUSED';
          slot_date?: string;
          slot_time_start?: string;
          slot_time_end?: string;
          slot_location?: string;
          slot_description?: string | null;
          sent_at?: string;
          sent_by?: string | null;
          created_at?: string;
        };
      };
      notification_recipients: {
        Row: {
          id: string;
          notification_id: string;
          user_id: string;
          received: boolean;
          clicked: boolean;
          clicked_at: string | null;
          action: 'ACCEPTED' | 'REFUSED' | null;
          action_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          notification_id: string;
          user_id: string;
          received?: boolean;
          clicked?: boolean;
          clicked_at?: string | null;
          action?: 'ACCEPTED' | 'REFUSED' | null;
          action_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          notification_id?: string;
          user_id?: string;
          received?: boolean;
          clicked?: boolean;
          clicked_at?: string | null;
          action?: 'ACCEPTED' | 'REFUSED' | null;
          action_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
