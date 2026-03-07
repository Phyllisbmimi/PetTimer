import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../LanguageSwitcher';

interface PasswordResetPageProps {
  onResetSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function PasswordResetPage({ onResetSuccess, onSwitchToLogin }: PasswordResetPageProps) {
  const { t } = useTranslation();
  const { sendPasswordResetEmail, resetPassword, isLoading, error } = useAuthStore();
  
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [showDevCode, setShowDevCode] = useState(false);

  // 開發模式：獲取重置碼
  const getResetCode = () => {
    const resetData = localStorage.getItem(`petTimer_reset_${email}`);
    if (resetData) {
      const { code } = JSON.parse(resetData);
      return code;
    }
    return null;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email.includes('@')) {
      setLocalError(t('auth.invalidEmail'));
      return;
    }

    await sendPasswordResetEmail(email);
    if (!error) {
      setStep('code');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setStep('password');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 6) {
      setLocalError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.passwordMismatch'));
      return;
    }

    await resetPassword(email, code, password);
    if (!error) {
      onResetSuccess();
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
            {t('auth.resetPassword')}
          </h1>
          <p className="text-gray-500">{t('auth.resetPasswordDesc')}</p>
        </div>

        {/* 錯誤提示 */}
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error || localError}
          </div>
        )}

        {/* 步驟 1: 輸入郵箱 */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? t('auth.sending') : t('auth.sendCode')}
            </button>
          </form>
        )}

        {/* 步驟 2: 輸入驗證碼 */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.verificationCode')}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition text-center text-lg font-bold tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {t('auth.verifyCode')}
            </button>
          </form>
        )}

        {/* 步驟 3: 設置新密碼 */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.newPassword')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

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
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? t('auth.resetting') : t('auth.resetPassword')}
            </button>
          </form>
        )}

        {/* 返回登入 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onSwitchToLogin}
            className="w-full text-center text-gray-600 hover:text-gray-700 font-medium text-sm"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
