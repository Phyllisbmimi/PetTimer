import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { useAuthStore } from '../../store/authStore';

type AuthPage = 'login' | 'signup';

interface AuthContainerProps {
  onAuthSuccess: () => void;
  onGuestMode: () => void;
}

export default function AuthContainer({ onAuthSuccess, onGuestMode }: AuthContainerProps) {
  const [currentPage, setCurrentPage] = useState<AuthPage>('login');
  const { isAuthenticated } = useAuthStore();

  // 監聽認證狀態
  React.useEffect(() => {
    if (isAuthenticated) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage
          onSwitchToSignup={() => setCurrentPage('signup')}
          onGuestMode={onGuestMode}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}
    </>
  );
}
