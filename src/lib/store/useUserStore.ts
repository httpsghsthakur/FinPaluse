import { create } from 'zustand';
import { CurrencyCode, UserProfile } from '../../types';

interface UserState {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setChatPersonality: (personality: 'concise' | 'balanced' | 'detailed') => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex.morgan@finpluse.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'INR',
  theme: 'dark',
  firstDayOfMonth: 1,
  notificationsEnabled: true,
  chatPersonality: 'balanced',
  shareDataForAnalytics: true,
  is2FAEnabled: false,
  pinCode: '4829',
};

const USER_STORAGE_KEY = 'finpluse_user_profile';

function loadInitialProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading user profile:', e);
  }
  return DEFAULT_PROFILE;
}

export const useUserStore = create<UserState>((set) => ({
  profile: loadInitialProfile(),

  updateProfile: (updates) =>
    set((state) => {
      const updated = { ...state.profile, ...updates };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving user profile:', e);
      }
      return { profile: updated };
    }),

  setCurrency: (currency) =>
    set((state) => {
      const updated = { ...state.profile, currency };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { profile: updated };
    }),

  setTheme: (theme) =>
    set((state) => {
      const updated = { ...state.profile, theme };
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { profile: updated };
    }),

  toggleTheme: () =>
    set((state) => {
      const nextTheme: 'dark' | 'light' = state.profile.theme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      const updated = { ...state.profile, theme: nextTheme };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { profile: updated };
    }),

  setChatPersonality: (chatPersonality) =>
    set((state) => {
      const updated = { ...state.profile, chatPersonality };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { profile: updated };
    }),
}));
