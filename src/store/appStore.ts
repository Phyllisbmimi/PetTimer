import { create } from 'zustand';
import { Pet, UserData, Goal, PomodoroSession, CheckInRecord } from '../types';
import { useAuthStore } from './authStore';

export type AppTheme =
  | 'minecraft'
  | 'naruto'
  | 'haikyuu'
  | 'fairyTail'
  | 'minimalDark'
  | 'minimalLight';

interface AppStore {
  // 用戶數據
  user: UserData | null;
  setUser: (user: UserData) => void;
  
  // 寵物管理
  currentPet: Pet | null;
  setCurrentPet: (pet: Pet) => void;
  updatePetStats: (petId: string, stats: Partial<Pet>) => void;
  gainPetExperience: (petId: string, amount: number) => void;
  feedPet: (petId: string) => void;
  petPet: (petId: string) => void;
  
  // 目標管理
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  
  // 番茄鐘
  sessions: PomodoroSession[];
  addSession: (session: PomodoroSession) => void;
  completeSession: (sessionId: string) => void;
  
  // 簽到
  checkIns: CheckInRecord[];
  addCheckIn: (checkIn: CheckInRecord) => void;
  
  // 貨幣和火焰
  coins: number;
  fire: number;
  addCoins: (amount: number) => void;
  addFire: (amount: number) => void;
  useCoins: (amount: number) => void;
  useFire: (amount: number) => void;
  
  // 音效設置
  soundEnabled: boolean;
  toggleSound: () => void;
  
  // 主題設置
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  
  // 活動數據持久化
  loadActivityFromBackend: () => Promise<void>;
  saveActivityToBackend: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始狀態
  user: null,
  currentPet: null,
  goals: [],
  sessions: [],
  checkIns: [],
  coins: 0,
  fire: 0,
  soundEnabled: true,
  theme: 'minecraft',
  
  // 用戶管理
  setUser: (user) => set({ user }),
  
  // 寵物管理
  setCurrentPet: (pet) => set({ currentPet: pet }),
  
  updatePetStats: (petId, stats) => {
    const user = get().user;
    if (!user) return;
    
    const updatedPets = user.pets.map(pet =>
      pet.id === petId ? { ...pet, ...stats } : pet
    );
    
    set({
      user: { ...user, pets: updatedPets },
      currentPet:
        get().currentPet?.id === petId
          ? { ...get().currentPet!, ...stats }
          : get().currentPet,
    });
  },

  gainPetExperience: (petId, amount) => {
    const pet = get().currentPet;
    if (!pet || pet.id !== petId) return;

    const totalExperience = pet.experience + amount;
    const levelFromExp = Math.floor(totalExperience / 100) + 1;
    const newLevel = Math.max(pet.level, levelFromExp);

    set({
      currentPet: {
        ...pet,
        experience: totalExperience,
        level: newLevel,
      },
    });
  },
  
  feedPet: (petId) => {
    const pet = get().currentPet;
    if (!pet || pet.id !== petId) return;
    
    const coins = get().coins;
    if (coins < 10) return; // 需要 10 個硬幣
    
    set({
      coins: coins - 10,
      currentPet: {
        ...pet,
        hunger: Math.max(0, pet.hunger - 30),
        happiness: Math.min(100, pet.happiness + 10),
        experience: pet.experience + 15,
        level: Math.max(pet.level, Math.floor((pet.experience + 15) / 100) + 1),
        lastFed: new Date(),
      },
    });
  },
  
  petPet: (petId) => {
    const pet = get().currentPet;
    if (!pet || pet.id !== petId) return;
    
    set({
      currentPet: {
        ...pet,
        happiness: Math.min(100, pet.happiness + 20),
        experience: pet.experience + 10,
        level: Math.max(pet.level, Math.floor((pet.experience + 10) / 100) + 1),
        lastPetted: new Date(),
      },
    });
  },
  
  // 目標管理
  addGoal: (goal) => set((state) => ({
    goals: [...state.goals, goal],
  })),
  
  updateGoal: (goalId, updates) =>
    set((state) => ({
      goals: state.goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      ),
    })),
  
  deleteGoal: (goalId) =>
    set((state) => ({
      goals: state.goals.filter(goal => goal.id !== goalId),
    })),
  
  // 番茄鐘
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  
  completeSession: (sessionId) => {
    const sessions = get().sessions;
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) return;
    
    const fireEarned = 1; // 每個番茄鐘賺取 1 火焰
    
    set((state) => {
      const pet = state.currentPet;
      const gainedExp = session.completed ? 0 : 25;

      return {
        sessions: state.sessions.map(s =>
          s.id === sessionId ? { ...s, completed: true, endTime: new Date(), fireEarned } : s
        ),
        fire: state.fire + fireEarned,
        coins: state.coins + Math.floor(session.duration / 5), // 每 5 分鐘賺 1 硬幣
        currentPet: pet
          ? {
              ...pet,
              energy: Math.max(0, pet.energy - 10),
              happiness: Math.min(100, pet.happiness + 5),
              experience: pet.experience + gainedExp,
              level: Math.max(pet.level, Math.floor((pet.experience + gainedExp) / 100) + 1),
            }
          : pet,
      };
    });
  },
  
  // 簽到
  addCheckIn: (checkIn) =>
    set((state) => ({
      checkIns: [...state.checkIns, checkIn],
    })),
  
  // 貨幣和火焰
  addCoins: (amount) =>
    set((state) => ({
      coins: state.coins + amount,
    })),
  
  addFire: (amount) =>
    set((state) => ({
      fire: state.fire + amount,
    })),
  
  useCoins: (amount) => {
    const coins = get().coins;
    if (coins >= amount) {
      set({ coins: coins - amount });
    }
  },
  
  useFire: (amount) => {
    const fire = get().fire;
    if (fire >= amount) {
      set({ fire: fire - amount });
    }
  },
  
  // 音效設置
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  
  // 主題設置
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('petTimer_theme', theme);
  },
  
  // 從後端加載活動數據
  loadActivityFromBackend: async () => {
    try {
      console.log('🔄 Loading activity from backend...');
      const activity = await useAuthStore.getState().loadActivity();
      if (activity) {
        console.log('📦 Activity data received:', {
          hasUser: !!activity.user,
          hasPet: !!activity.currentPet,
          petType: activity.currentPet?.type,
          coins: activity.coins,
          itemsCount: activity.currentPet?.items?.length || 0,
        });
        set({
          user: activity.user,
          currentPet: activity.currentPet,
          goals: activity.goals || [],
          sessions: activity.sessions || [],
          checkIns: activity.checkIns || [],
          coins: activity.coins || 0,
          fire: activity.fire || 0,
          soundEnabled: activity.soundEnabled !== undefined ? activity.soundEnabled : true,
          theme: (activity.theme as AppTheme) || 'minecraft',
        });
        console.log('✅ Activity data loaded from backend successfully');
      } else {
        console.log('⚠️ No activity data found on backend');
      }
    } catch (error) {
      console.error('❌ Error loading activity from backend:', error);
    }
  },
  
  // 保存活動數據到後端
  saveActivityToBackend: async () => {
    try {
      const state = get();
      const activity = {
        user: state.user,
        currentPet: state.currentPet,
        goals: state.goals,
        sessions: state.sessions,
        checkIns: state.checkIns,
        coins: state.coins,
        fire: state.fire,
        soundEnabled: state.soundEnabled,
        theme: state.theme,
      };
      console.log('💾 Saving activity to backend:', {
        hasUser: !!activity.user,
        hasPet: !!activity.currentPet,
        petType: activity.currentPet?.type,
        coins: activity.coins,
        itemsCount: activity.currentPet?.items?.length || 0,
      });
      await useAuthStore.getState().saveActivity(activity);
      console.log('✅ Activity save completed');
    } catch (error) {
      console.error('❌ Error saving activity to backend:', error);
    }
  },
}));
