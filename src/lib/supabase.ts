import { API_CONFIG } from './api/config';

/**
 * Lightweight Supabase Auth & Client Adapter
 * Allows logging in, signing up, and attaching JWT bearer tokens
 * to all backend API requests without hard dependencies.
 */

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  user: SupabaseUser;
}

const SUPABASE_AUTH_STORAGE_KEY = 'sb-access-token';
const SUPABASE_USER_STORAGE_KEY = 'sb-user-session';

export const supabaseAuth = {
  /**
   * Save access token from Supabase login
   */
  setSession(session: SupabaseSession): void {
    localStorage.setItem(SUPABASE_AUTH_STORAGE_KEY, session.access_token);
    localStorage.setItem(SUPABASE_USER_STORAGE_KEY, JSON.stringify(session.user));
  },

  /**
   * Get active access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(SUPABASE_AUTH_STORAGE_KEY) || localStorage.getItem('supabase_access_token');
  },

  /**
   * Get cached user profile
   */
  getUser(): SupabaseUser | null {
    const raw = localStorage.getItem(SUPABASE_USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Clear session on logout
   */
  signOut(): void {
    localStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
    localStorage.removeItem(SUPABASE_USER_STORAGE_KEY);
    localStorage.removeItem('supabase_access_token');
  },

  /**
   * Returns auth headers to attach to API requests
   */
  getHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
};
