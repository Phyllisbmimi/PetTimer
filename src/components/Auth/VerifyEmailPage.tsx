import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import LanguageSwitcher from '../LanguageSwitcher';

interface VerifyEmailPageProps {
  email: string;
  onVerifySuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function VerifyEmailPage({ email, onVerifySuccess, onSwitchToLogin }: VerifyEmailPageProps) {
  const { t } = useTranslation();
  const { verifyEmail, isLoading, error, sendVerificationEmail } = useAuthStore();
  
  const [code, setCode] = useState('');
  const [showDevCode, setShowDevCode] = useState(false);

  // 開發模式：獲取驗證碼
  const getVerificationCode = () => {
    const verificationData = localStorage.getItem(`petTimer_verification_${email}`);
    if (verificationData) {
      const { code } = JSON.parse(verificationData);
      return code;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyEmail(email, code);
    if (!error) {
      onVerifySuccess();
    }
  };

  const handleResendCode = async () => {
    await sendVerificationEmail(email);
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
            {t('auth.verifyEmail')}
          </h1>
          <p className="text-gray-500">{t('auth.verifyEmailDesc')}</p>
          <p className="text-gray-400 text-sm mt-2">{email}</p>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 驗證表單 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 驗證碼輸入 */}
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
            <p className="text-gray-500 text-xs mt-2">{t('auth.codeSentTo')} {email}</p>
          </div>

          {/* 驗證按鈕 */}
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
          >
            {isLoading ? t('auth.verifying') : t('auth.verifyEmail')}
          </button>
        </form>

        {/* 重新發送驗證碼 */}
        <button
          onClick={handleResendCode}
          disabled={isLoading}
          className="w-full text-center mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm disabled:opacity-50"
        >
          {t('auth.resendCode')}
        </button>

        {/* 開發模式：顯示驗證碼 */}
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-semibold text-sm">🔧 Dev Mode</span>
            </div>
            <button
              onClick={() => setShowDevCode(!showDevCode)}
              className="text-yellow-600 hover:text-yellow-700 font-medium text-xs underline"
            >
              {showDevCode ? 'Hide Code' : 'Show Code'}
            </button>
          </div>
          {showDevCode && (
            <div className="mt-2">
              <p className="text-yellow-700 text-xs mb-2">
                ⚠️ No real email service configured. Your verification code is:
              </p>
              <div className="bg-white border-2 border-yellow-400 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600 tracking-widest">
                  {getVerificationCode() || 'N/A'}
                </p>
              </div>
              <p className="text-yellow-600 text-xs mt-2 text-center">
                Copy this code and paste it above to verify your email.
              </p>
            </div>
          )}
        </div>

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
