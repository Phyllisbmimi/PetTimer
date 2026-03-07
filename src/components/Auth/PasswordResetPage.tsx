import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

interface PasswordResetPageProps {
  onResetSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function PasswordResetPage({ onResetSuccess, onSwitchToLogin }: PasswordResetPageProps) {
  const { t } = useTranslation();
  const [noticeClosed, setNoticeClosed] = useState(false);

  const handleBackToLogin = () => {
    if (!noticeClosed) {
      setNoticeClosed(true);
    }
    onResetSuccess();
    onSwitchToLogin();
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

        {!noticeClosed && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
            {t('auth.passwordResetUnavailable') || 'Password reset is currently unavailable. Please sign in with your username and password.'}
          </div>
        )}

        {/* 返回登入 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleBackToLogin}
            className="w-full text-center text-gray-600 hover:text-gray-700 font-medium text-sm"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}
