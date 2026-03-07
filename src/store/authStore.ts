import { create } from 'zustand';
import { User, AuthState } from '../types';

interface UserActivity {
  user: any;
  currentPet: any;
  goals: any[];
  sessions: any[];
  checkIns: any[];
  coins: number;
  fire: number;
  soundEnabled: boolean;
  theme: string;
  updatedAt?: string;
}

interface AuthStore extends AuthState {
  // 認證方法
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => void;
  
  // 活動數據方法
  saveActivity: (activity: UserActivity) => Promise<void>;
  loadActivity: () => Promise<UserActivity | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // 初始狀態
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  error: null,

  // 設置方法
  setUser: (user) => set({ user, isAuthenticated: !!user, isGuest: false }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  // 檢查認證狀態
  checkAuthStatus: () => {
    const guestMode = localStorage.getItem('petTimer_guest_mode');
    if (guestMode === 'true') {
      set({ user: null, isAuthenticated: false, isGuest: true });
      return;
    }

    const savedUser = localStorage.getItem('petTimer_auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({ user, isAuthenticated: true, isGuest: false });
      } catch (err) {
        localStorage.removeItem('petTimer_auth_user');
      }
    }
  },

  // 註冊新用戶
  register: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        'http://localhost:3001/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      const newUser: User = {
        id: data.user.id,
        username: data.user.username,
        createdAt: new Date(),
      };

      // 🔄 遷移訪客數據到新帳號
      const guestData = localStorage.getItem('petTimer_guest_data');
      if (guestData) {
        localStorage.setItem(
          `petTimer_appData_${username}`,
          guestData
        );
        console.log('✅ 訪客數據已遷移到新帳號');
      }

      set({ user: newUser, isAuthenticated: true, isLoading: false });
      localStorage.setItem('petTimer_auth_user', JSON.stringify(newUser));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
    }
  },

  // 登錄
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        'http://localhost:3001/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      const user: User = {
        id: data.user.id,
        username: data.user.username,
        createdAt: new Date(),
      };

      // 保存登錄狀態和 JWT token
      localStorage.setItem('petTimer_auth_user', JSON.stringify(user));
      localStorage.setItem('petTimer_auth_token', data.token);
      localStorage.removeItem('petTimer_guest_mode');

      set({ user, isAuthenticated: true, isGuest: false, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  continueAsGuest: () => {
    localStorage.setItem('petTimer_guest_mode', 'true');
    set({
      user: null,
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      error: null,
    });
  },

  // 登出
  logout: () => {
    localStorage.removeItem('petTimer_auth_user');
    localStorage.removeItem('petTimer_auth_token');
    localStorage.removeItem('petTimer_guest_mode');
    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    });
  },

  // 保存用戶活動數據到後端
  saveActivity: async (activity: UserActivity) => {
    try {
      const token = localStorage.getItem('petTimer_auth_token');
      if (!token) {
        console.warn('No auth token available');
        return;
      }

      const response = await fetch(
        'http://localhost:3001/api/auth/activity',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ activity }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to save activity:', data.error);
      } else {
        console.log('✅ Activity data saved to backend');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  },

  // 從後端加載用戶活動數據
  loadActivity: async (): Promise<UserActivity | null> => {
    try {
      const token = localStorage.getItem('petTimer_auth_token');
      if (!token) {
        console.warn('No auth token available');
        return null;
      }

      const response = await fetch(
        'http://localhost:3001/api/auth/activity',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.activity) {
        console.log('✅ Activity data loaded from backend');
        return data.activity;
      }
      return null;
    } catch (error) {
      console.error('Error loading activity:', error);
      return null;
    }
  },
}));
