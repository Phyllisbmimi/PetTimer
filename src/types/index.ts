// 認證相關
export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VerificationCode {
  code: string;
  email: string;
  expiresAt: Date;
  type: 'email-verification' | 'password-reset';
}

// 寵物類型
export type PetType = 'fox' | 'cat' | 'dog';

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  level: number;
  experience: number;
  hunger: number; // 0-100
  happiness: number; // 0-100
  energy: number; // 0-100
  lastFed: Date;
  lastPetted: Date;
  items: PetItem[];
}

export interface PetItem {
  id: string;
  type: 'food' | 'clothing' | 'toy';
  name: string;
  rarity: 'common' | 'rare' | 'epic';
}

// 用戶目標
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  progress: number; // 0-100
  subtasks: Subtask[];
  shortTermGoals: string[];
  createdAt: Date;
  status: 'active' | 'completed' | 'abandoned';
  // AI 智能規劃字段
  level?: 'beginner' | 'intermediate' | 'advanced';
  desiredOutcome?: string; // 期望達成的成果
  timeframe?: number; // 時間框架（天數）
  dailyPlan?: DailyTask[]; // AI 生成的每日計劃
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  weight: number; // 用於計算進度
}

export interface DailyTask {
  day: number; // 第幾天
  date: Date;
  tasks: string[]; // 當天要做的任務
  completed: boolean;
}

// 番茄鐘會話
export interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // 分鐘
  completed: boolean;
  goalId?: string;
  fireEarned: number;
}

// 用戶數據
export interface UserData {
  id: string;
  username: string;
  email: string;
  level: number;
  coins: number;
  fire: number;
  currentPet?: Pet;
  pets: Pet[];
  goals: Goal[];
  sessions: PomodoroSession[];
  checkInHistory: CheckInRecord[];
  createdAt: Date;
  stats: UserStats;
}

export interface UserStats {
  totalSessionsCompleted: number;
  totalMinutesFocused: number;
  totalCoinsEarned: number;
  totalFireEarned: number;
  currentStreak: number; // 連続簽到天數
  longestStreak: number;
  lastActiveDate?: Date;
}

// 簽到記錄
export interface CheckInRecord {
  id: string;
  date: Date;
  focusTime: number; // 分鐘
  activities: string[];
  achievement?: string;
  photoUrl?: string;
  mood: 'happy' | 'normal' | 'tired';
  notes?: string;
}

// AI 助手消息
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIAssistant {
  messages: Message[];
  suggestedGoals?: string[];
  motivation?: string;
}
