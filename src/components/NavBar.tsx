import React from 'react';
import { Home, Target, Calendar, ShoppingBag, User, LogOut, Sparkles, Bot, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import LanguageSwitcher from './LanguageSwitcher';

interface NavBarProps {
  currentPage: 'home' | 'goals' | 'checkin' | 'shop' | 'animals' | 'ai' | 'profile';
  onNavigate: (page: 'home' | 'goals' | 'checkin' | 'shop' | 'animals' | 'ai' | 'profile') => void;
  coins: number;
  fire: number;
  navigationLocked?: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ currentPage, onNavigate, coins, fire, navigationLocked = false }) => {
  const { t } = useTranslation();
  const { logout, user, isGuest } = useAuthStore();
  const { saveActivityToBackend } = useAppStore();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'goals', label: t('nav.goals'), icon: Target },
    { id: 'checkin', label: t('nav.checkin'), icon: Calendar },
    { id: 'shop', label: t('nav.shop'), icon: ShoppingBag },
    { id: 'animals', label: t('nav.animals'), icon: Sparkles },
    { id: 'ai', label: t('ai.title'), icon: Bot },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  const handleLogout = async () => {
    if (confirm('確定要登出嗎？')) {
      console.log('🚪 Logout initiated - saving data before logout...');
      // 保存數據到後端再登出
      await saveActivityToBackend();
      console.log('✅ Data saved, logging out...');
      logout();
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="w-full px-3 lg:px-4">
        <div className="flex items-center h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐾</span>
            <h1 className="text-white font-bold text-xl hidden sm:block">PetTimer</h1>
          </div>

          {/* 導航項目 */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className="flex items-center gap-1 md:gap-2 w-max pr-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isDisabled = navigationLocked && currentPage !== item.id;
              return (
                <button
                  key={item.id}
                  onClick={() =>
                    onNavigate(item.id as 'home' | 'goals' | 'checkin' | 'shop' | 'animals' | 'ai' | 'profile')
                  }
                  disabled={isDisabled}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                    currentPage === item.id
                      ? 'bg-accent text-dark font-bold'
                      : isDisabled
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden xl:inline text-sm whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
            </div>
          </div>

          {/* 語言切換器、資源顯示和登出/登入 */}
          <div className="flex items-center gap-2 ml-1 sm:ml-2 shrink-0">
            <LanguageSwitcher />
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
              <span className="text-lg">🔥</span>
              <span className="text-white font-bold text-sm">{fire}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
              <span className="text-lg">🪙</span>
              <span className="text-white font-bold text-sm">{coins}</span>
            </div>
            {isGuest ? (
              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg bg-accent text-dark font-bold hover:bg-accent/90 transition-all flex items-center gap-2 whitespace-nowrap"
                  title="Sign In / Sign Up"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('auth.signInUp')}</span>
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                <span className="text-white text-sm hidden sm:inline">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
