import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../LanguageSwitcher';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const { t } = useTranslation();
  const { register, isLoading, error } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsSuccess(false);

    // 驗證
    if (username.length < 3) {
      setLocalError(t('auth.usernameTooShort'));
      return;
    }

    if (password.length < 6) {
      setLocalError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    await register(username, password);
    
    if (useAuthStore.getState().isAuthenticated) {
      setIsSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 relative">
      {/* 語言選擇器 */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('auth.signUp')}
          </h1>
          <p className="text-gray-500">{t('auth.createAccount')}</p>
        </div>

        {/* 成功提示 */}
        {isSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            ✅ {t('auth.signUpSuccess') || 'Registration successful!'}
          </div>
        )}

        {/* 錯誤提示 */}
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error || localError}
          </div>
        )}

        {/* 註冊表單 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用戶名輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.usernamePlaceholder') || 'Enter username'}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              required
              minLength={3}
            />
          </div>

          {/* 密碼輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              required
              minLength={6}
            />
          </div>

          {/* 確認密碼輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
              required
              minLength={6}
            />
          </div>

          {/* 註冊按鈕 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            {isLoading ? t('auth.signingUp') : t('auth.signUp')}
          </button>
        </form>

        {/* 轉換到登入 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            {t('auth.hasAccount')}{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 font-bold"
            >
              {t('auth.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
