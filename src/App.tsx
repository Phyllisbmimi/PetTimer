import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { Pet, UserData, Goal, CheckInRecord, PetItem } from './types';
import { useCheckInStreak } from './hooks';
import { PetSelector } from './components/PetSelector';
import { NavBar } from './components/NavBar';
import { PetCard } from './components/PetCard';
import { PomodoroTimer } from './components/PomodoroTimer';
import { GoalTracker } from './components/GoalTracker';
import { CheckInCalendar } from './components/CheckInCalendar';
import { Shop } from './components/Shop';
import AuthContainer from './components/Auth/AuthContainer';
import AnimalsPage from './components/AnimalsPage';
import ThemeSelector from './components/ThemeSelector';
import AIAssistant from './components/AIAssistant';
import AutoUpdater from './components/AutoUpdater';
import type { AppTheme } from './store/appStore';

type PageType = 'home' | 'goals' | 'checkin' | 'shop' | 'animals' | 'ai' | 'profile';

const SUPPORTED_THEMES: AppTheme[] = [
  'minecraft',
  'naruto',
  'haikyuu',
  'fairyTail',
  'minimalDark',
  'minimalLight',
];

function App() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [hasPet, setHasPet] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showLeaveFocusConfirm, setShowLeaveFocusConfirm] = useState(false);
  const [pendingPage, setPendingPage] = useState<PageType | null>(null);
  const hasAppliedMimiBonus = useRef(false);
  
  // Zustand stores
  const {
    user,
    setUser,
    currentPet,
    setCurrentPet,
    gainPetExperience,
    feedPet,
    petPet,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    sessions,
    checkIns,
    addCheckIn,
    coins,
    fire,
    addCoins,
    addFire,
    useCoins,
    theme,
    setTheme,
    loadActivityFromBackend,
    saveActivityToBackend,
  } = useAppStore();

  const {
    isAuthenticated,
    isGuest,
    checkAuthStatus,
    continueAsGuest,
    user: authUser,
  } = useAuthStore();

  const streak = useCheckInStreak(checkIns);
  const orderedPages: PageType[] = ['home', 'goals', 'checkin', 'shop', 'animals', 'ai', 'profile'];

  const isBackpackItem = (name: string) => name === 'backpack' || name === '校園背包';

  const removeBackpackItems = <T extends { items: PetItem[] }>(pet: T): T => ({
    ...pet,
    items: pet.items.filter((item) => !isBackpackItem(item.name)),
  });

  // 初始化認證狀態
  useEffect(() => {
    checkAuthStatus();
    // 載入保存的主題
    const savedTheme = localStorage.getItem('petTimer_theme');
    if (savedTheme && SUPPORTED_THEMES.includes(savedTheme as AppTheme)) {
      setTheme(savedTheme as AppTheme);
    }
  }, [checkAuthStatus, setTheme]);

  // 初始化用戶數據
  useEffect(() => {
    if (isGuest) {
      const existingGuest = localStorage.getItem('petTimer_guest_data');
      if (existingGuest) {
        const userData = JSON.parse(existingGuest);
        setUser(userData);
        if (userData.currentPet) {
          setCurrentPet(userData.currentPet);
          setHasPet(true);
        }
      }
      return;
    }

    if (isAuthenticated && authUser) {
      // 🔄 從後端加載用戶活動數據
      loadActivityFromBackend().then(() => {
        // 檢查是否成功加載了寵物數據
        const currentState = useAppStore.getState();
        if (currentState.currentPet) {
          setHasPet(true);
        }
      });
    }
  }, [isAuthenticated, isGuest, authUser, setUser, setCurrentPet, loadActivityFromBackend]);

  useEffect(() => {
    if (!isAuthenticated || !authUser || hasAppliedMimiBonus.current) return;
    if (authUser.username.trim().toLowerCase() !== 'mimi') return;

    if (coins < 2000) {
      addCoins(2000 - coins);
    }
    hasAppliedMimiBonus.current = true;
  }, [isAuthenticated, authUser, coins, addCoins]);

  useEffect(() => {
    const currentPetHasBackpack = currentPet?.items.some((item) => isBackpackItem(item.name));
    const userHasBackpack = user?.pets.some((pet) => pet.items.some((item) => isBackpackItem(item.name)));

    if (!currentPetHasBackpack && !userHasBackpack) return;

    if (currentPetHasBackpack && currentPet) {
      setCurrentPet(removeBackpackItems(currentPet));
    }

    if (user) {
      const cleanedPets = user.pets.map((pet) => removeBackpackItems(pet));
      const cleanedCurrentPet = user.currentPet ? removeBackpackItems(user.currentPet) : user.currentPet;
      setUser({
        ...user,
        pets: cleanedPets,
        currentPet: cleanedCurrentPet,
      });
    }
  }, [user, currentPet, setUser, setCurrentPet]);

  // 保存用戶數據
  useEffect(() => {
    if (user && isGuest) {
      localStorage.setItem('petTimer_guest_data', JSON.stringify(user));
      return;
    }

    if (user && isAuthenticated && authUser) {
      // 🔄 自動保存活動數據到後端（防抖處理）
      const saveTimer = setTimeout(() => {
        saveActivityToBackend();
      }, 2000); // 2秒後保存，避免頻繁請求

      return () => clearTimeout(saveTimer);
    }
  }, [user, currentPet, goals, sessions, checkIns, coins, fire, isAuthenticated, isGuest, authUser, saveActivityToBackend]);

  // 🔒 頁面關閉前保存數據（防止數據丟失）
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;

    const handleBeforeUnload = () => {
      // 立即保存數據（同步方式）
      saveActivityToBackend();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 標籤頁隱藏時保存數據
        saveActivityToBackend();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, authUser, saveActivityToBackend]);

  const handleSelectPet = (pet: Pet) => {
    const newUser: UserData = {
      id: Date.now().toString(),
      username: isGuest ? 'Visitor' : 'User',
      email: '',
      level: 1,
      coins: 100,
      fire: 0,
      currentPet: pet,
      pets: [pet],
      goals: [],
      sessions: [],
      checkInHistory: [],
      createdAt: new Date(),
      stats: {
        totalSessionsCompleted: 0,
        totalMinutesFocused: 0,
        totalCoinsEarned: 0,
        totalFireEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: new Date(),
      },
    };

    setUser(newUser);
    setCurrentPet(pet);
    setHasPet(true);
  };

  const handleAddGoal = (goal: Goal) => {
    addGoal(goal);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    updateGoal(goalId, updates);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
  };

  const handleAddCheckIn = (checkIn: CheckInRecord) => {
    addCheckIn(checkIn);
  };

  const handleBuyItem = (item: PetItem, cost: number) => {
    if (coins >= cost) {
      useCoins(cost);

      if (currentPet && !currentPet.items.some((existingItem) => existingItem.id === item.id)) {
        setCurrentPet({
          ...currentPet,
          items: [...currentPet.items, item],
        });
      }

      const localizedItemName = t(`shop.items.${item.name}`, { defaultValue: item.name });
      alert(t('shop.purchaseSuccess', { item: localizedItemName }));
    }
  };

  const handleNavigate = (page: PageType) => {
    if (isTimerRunning && page !== currentPage) {
      setPendingPage(page);
      setShowLeaveFocusConfirm(true);
      return;
    }
    setCurrentPage(page);
  };

  const handleStayInFocus = () => {
    setPendingPage(null);
    setShowLeaveFocusConfirm(false);
  };

  const handleConfirmLeaveFocus = () => {
    const targetPage = pendingPage;
    setShowLeaveFocusConfirm(false);
    setPendingPage(null);
    setIsTimerRunning(false);
    if (targetPage) {
      setCurrentPage(targetPage);
    }
  };

  const handleStepPage = (direction: 'previous' | 'next') => {
    const currentIndex = orderedPages.indexOf(currentPage);
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % orderedPages.length
        : (currentIndex - 1 + orderedPages.length) % orderedPages.length;

    handleNavigate(orderedPages[nextIndex]);
  };

  const handleFeedPet = () => {
    if (currentPet) {
      feedPet(currentPet.id);
    }
  };

  const handleConsumePetItem = (itemId: string) => {
    if (!currentPet) return;

    setCurrentPet({
      ...currentPet,
      items: currentPet.items.filter((item) => item.id !== itemId),
    });
  };

  const handlePetPet = () => {
    if (currentPet) {
      petPet(currentPet.id);
    }
  };

  // 根據主題返回不同的背景樣式
  const getThemeStyles = () => {
    switch (theme) {
      case 'minecraft':
        return {
          background: 'bg-gradient-to-br from-green-700 via-lime-600 to-amber-700',
          pattern: 'minecraft-pattern',
          card: 'bg-gradient-to-br from-emerald-100 to-amber-100',
          text: 'text-white',
        };
      case 'naruto':
        return {
          background: 'bg-gradient-to-br from-orange-600 via-red-500 to-yellow-600',
          pattern: 'naruto-pattern',
          card: 'bg-gradient-to-br from-orange-100 to-red-100',
          text: 'text-white',
        };
      case 'haikyuu':
        return {
          background: 'bg-gradient-to-br from-orange-500 via-slate-700 to-black',
          pattern: 'haikyuu-pattern',
          card: 'bg-gradient-to-br from-orange-100 to-slate-100',
          text: 'text-white',
        };
      case 'fairyTail':
        return {
          background: 'bg-gradient-to-br from-red-600 via-amber-500 to-sky-500',
          pattern: 'fairy-tail-pattern',
          card: 'bg-gradient-to-br from-red-100 to-sky-100',
          text: 'text-white',
        };
      case 'minimalDark':
        return {
          background: 'bg-black',
          pattern: '',
          card: 'bg-black',
          text: 'text-red-500',
        };
      case 'minimalLight':
        return {
          background: 'bg-white',
          pattern: '',
          card: 'bg-white',
          text: 'text-black',
        };
      default:
        return {
          background: 'bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400',
          pattern: '',
          card: 'bg-gradient-to-br from-yellow-100 to-pink-100',
          text: 'text-white',
        };
    }
  };

  const themeStyles = getThemeStyles();

  // 如果未認證且非訪客模式，顯示認證容器
  if (!isAuthenticated && !isGuest) {
    return <AuthContainer onAuthSuccess={() => {}} onGuestMode={continueAsGuest} />;
  }

  // 如果沒有寵物，顯示寵物選擇器
  if (!hasPet) {
    return <PetSelector onSelectPet={handleSelectPet} existingPets={[]} />;
  }

  return (
    <div className={`min-h-screen theme-${theme} ${themeStyles.background} ${themeStyles.pattern} ${themeStyles.text}`}>
      {/* 導航欄 */}
      <NavBar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        coins={coins}
        fire={fire}
        navigationLocked={isTimerRunning}
      />

      {/* 主容器 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 首頁 */}
        {currentPage === 'home' && currentPet && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 寵物卡片 */}
            <div className="lg:col-span-1">
              <PetCard pet={currentPet} onFeed={handleFeedPet} onPet={handlePetPet} />
            </div>

            {/* 番茄鐘 */}
            <div className="lg:col-span-2">
              <PomodoroTimer
                duration={25}
                onRunningChange={setIsTimerRunning}
                onComplete={() => {
                  addFire(1);
                  addCoins(5);
                  if (currentPet) {
                    gainPetExperience(currentPet.id, 25);
                  }
                  alert(t('home.pomodoroComplete'));
                }}
              />
            </div>
          </div>
        )}

        {/* 目標頁面 */}
        {currentPage === 'goals' && (
          <div>
            <GoalTracker
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        )}

        {/* 簽到頁面 */}
        {currentPage === 'checkin' && (
          <div>
            <CheckInCalendar
              checkIns={checkIns}
              onAddCheckIn={handleAddCheckIn}
              streak={streak}
            />
          </div>
        )}

        {/* 商店頁面 */}
        {currentPage === 'shop' && (
          <div>
            <Shop coins={coins} fire={fire} onBuy={handleBuyItem} />
          </div>
        )}

        {/* 動物頁面 */}
        {currentPage === 'animals' && currentPet && (
          <AnimalsPage
            pet={currentPet}
            onFeed={handleFeedPet}
            onPet={handlePetPet}
            onConsumeItem={handleConsumePetItem}
          />
        )}

        {/* AI 助手頁面 */}
        {currentPage === 'ai' && (
          <AIAssistant />
        )}

        {/* 個人資料頁面 */}
        {currentPage === 'profile' && (
          <div className="card-blur space-y-6">
            <h2 className="text-3xl font-bold text-white">👤 {t('profile.title')}</h2>

            {currentPet && (
              <div className="bg-white/10 rounded-xl p-6 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">
                    {currentPet.type === 'cat' && '🐱'}
                    {currentPet.type === 'dog' && '🐕'}
                    {currentPet.type === 'fox' && '🦊'}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{currentPet.name}</h3>
                  <p className="text-white/60">{t('pet.level', { level: currentPet.level })}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-white/60 text-sm">{t('profile.levelProgress')}</p>
                    <p className="text-white font-bold text-2xl">
                      {Math.floor((currentPet.experience / 1000) * 100)}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-white/60 text-sm">{t('pet.experience', { exp: currentPet.experience })}</p>
                    <p className="text-white font-bold text-2xl">{currentPet.experience}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/10 rounded-xl p-6 space-y-4 border border-white/20">
              <h3 className="text-white font-bold text-xl">📊 {t('profile.statistics')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">{t('profile.sessionsCompleted')}</p>
                  <p className="text-accent font-bold text-2xl">{sessions.length}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">{t('profile.checkInStreak')}</p>
                  <p className="text-accent font-bold text-2xl">{streak}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">{t('profile.totalCoins')}</p>
                  <p className="text-accent font-bold text-2xl">🪙 {coins}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">{t('profile.totalFire')}</p>
                  <p className="text-accent font-bold text-2xl">🔥 {fire}</p>
                </div>
              </div>
            </div>

            {/* 軟件信息 */}
            <div className="text-center text-white/60 text-sm">
              <p>{t('profile.softwareInfo')}</p>
              <p>{t('profile.tagline')}</p>
            </div>
            
            {/* 主題選擇器 */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <ThemeSelector />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => handleStepPage('previous')}
            disabled={isTimerRunning}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isTimerRunning
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Previous Page
          </button>
          <button
            onClick={() => handleStepPage('next')}
            disabled={isTimerRunning}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              isTimerRunning
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Next Page
          </button>
        </div>
      </div>
      
      {/* 自動更新組件 - 僅在 Tauri 環境中顯示 */}
      <AutoUpdater />

      {showLeaveFocusConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-dark">⚠️ Timer is running</h3>
            <p className="text-gray-700 text-sm">
              You are about to leave the focus page. Do you really want to leave?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStayInFocus}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue Focus
              </button>
              <button
                onClick={handleConfirmLeaveFocus}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Really want to leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
