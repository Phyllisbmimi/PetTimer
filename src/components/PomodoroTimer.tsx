import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePomodoro } from '../hooks';
import { useAppStore } from '../store/appStore';
import { AIAssistant } from './AIAssistant';

interface TimerProps {
  duration?: number;
  onComplete?: () => void;
  goalId?: string;
  onRunningChange?: (isRunning: boolean) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const PomodoroTimer: React.FC<TimerProps> = ({
  duration = 25,
  onComplete,
  goalId: _goalId,
  onRunningChange,
  onFullscreenChange,
}) => {
  const { t } = useTranslation();
  const [customDuration, setCustomDuration] = useState(duration);
  const [tempDuration, setTempDuration] = useState(String(duration));
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [petImageIndex, setPetImageIndex] = useState(0);
  const { minutes, seconds, isRunning, isCompleted, start, pause, reset, progress } =
    usePomodoro(customDuration, onComplete);
  const [sessionFire, setSessionFire] = useState(0);
  const currentPet = useAppStore((state) => state.currentPet);

  useEffect(() => {
    setPetImageIndex(0);
  }, [currentPet?.type]);

  const getPetImageCandidates = () => {
    const imageBaseUrl = import.meta.env.BASE_URL;
    if (!currentPet) return [];
    if (currentPet.type === 'dog') return [`${imageBaseUrl}backgrounds/dog.png`, `${imageBaseUrl}backgrounds/dog.jpg`];
    if (currentPet.type === 'cat') return [`${imageBaseUrl}backgrounds/cat.png`, `${imageBaseUrl}backgrounds/cat.jpg`];
    return [`${imageBaseUrl}backgrounds/fox.png`, `${imageBaseUrl}backgrounds/fox.jpg`];
  };

  const getPetImageSrc = () => {
    const candidates = getPetImageCandidates();
    return candidates[Math.min(petImageIndex, Math.max(candidates.length - 1, 0))] || '';
  };

  const handlePetImageError = () => {
    const candidates = getPetImageCandidates();
    if (petImageIndex < candidates.length - 1) {
      setPetImageIndex((index) => index + 1);
    }
  };

  const getPetEmoji = () => {
    if (!currentPet) return '🐾';
    if (currentPet.type === 'dog') return '🐕';
    if (currentPet.type === 'cat') return '🐱';
    return '🦊';
  };

  // 勵志標語
  const motivationalQuotes = [
    { en: '🌟 Stay focused! You can do it!', zhHK: '🌟 保持專注！你做得到！', zhCN: '🌟 保持专注！你做得到！' },
    { en: '💪 Keep going strong!', zhHK: '💪 繼續加油！', zhCN: '💪 继续加油！' },
    { en: '🎯 One step closer to your goal!', zhHK: '🎯 離目標又近一步！', zhCN: '🎯 离目标又近一步！' },
    { en: '🔥 You\'re doing amazing!', zhHK: '🔥 你做得好好！', zhCN: '🔥 你做得很棒！' },
    { en: '⭐ Focus brings success!', zhHK: '⭐ 專注帶來成功！', zhCN: '⭐ 专注带来成功！' },
    { en: '🚀 Almost there, don\'t give up!', zhHK: '🚀 就快完成，唔好放棄！', zhCN: '🚀 就快完成，别放弃！' },
  ];

  const getMotivationalQuote = () => {
    const lang = t('lang') || 'en';
    const index = Math.floor((progress * motivationalQuotes.length) % motivationalQuotes.length);
    const quote = motivationalQuotes[index];
    if (lang === 'zh-HK') return quote.zhHK;
    if (lang === 'zh-CN') return quote.zhCN;
    return quote.en;
  };

  useEffect(() => {
    if (isCompleted) {
      // 計算獲得的火焰
      // 完成一個番茄鐘 = 1 火焰
      setSessionFire(1);
    }
  }, [isCompleted]);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isRunning) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  const handleStart = () => {
    start();
    setIsFullscreen(true);
  };

  const handlePause = () => {
    pause();
  };

  const handleReset = () => {
    reset();
    setIsFullscreen(false);
  };

  const handleSaveDuration = () => {
    const value = parseInt(tempDuration);
    if (value >= 1 && value <= 120) {
      setCustomDuration(value);
      reset();
      setIsEditingDuration(false);
    } else {
      alert(t('home.invalidDuration') || 'Please enter a value between 1 and 120 minutes');
    }
  };

  const getTimerColor = () => {
    if (progress < 0.33) return 'text-green-500';
    if (progress < 0.66) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isFullscreen && isRunning) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 z-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* 專注時顯示寵物和勵志標語 */}
          {currentPet && (
            <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex flex-col items-center gap-6">
                <div className="animate-bounce">
                  {petImageIndex >= getPetImageCandidates().length ? (
                    <div className="text-8xl">{getPetEmoji()}</div>
                  ) : (
                    <img
                      src={getPetImageSrc()}
                      alt={currentPet.name}
                      className="w-28 h-28 object-contain drop-shadow-2xl"
                      draggable={false}
                      onError={handlePetImageError}
                    />
                  )}
                </div>
                <div className="text-white font-bold text-3xl">{currentPet.name}</div>
                <div className="text-white/90 text-2xl text-center font-semibold bg-white/20 backdrop-blur-sm rounded-full px-8 py-3 shadow-lg">
                  {getMotivationalQuote()}
                </div>
              </div>
            </div>
          )}

          {/* 大號計時器 */}
          <div className="text-9xl font-bold text-white drop-shadow-2xl">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* 進度條 */}
          <div className="w-96 mx-auto">
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* 控制按鈕 */}
          <div className="flex gap-6 justify-center mt-8">
            <button
              onClick={handlePause}
              className="btn-secondary bg-white/20 backdrop-blur-md text-white hover:bg-white/30 px-8 py-4 text-xl"
            >
              ⏸️ {t('home.pause')}
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary bg-red-500/50 backdrop-blur-md text-white hover:bg-red-500/70 px-8 py-4 text-xl"
            >
              🔄 {t('home.reset')}
            </button>
          </div>

          {/* AI 助手按鈕 */}
          {!showAIAssistant && (
            <button
              onClick={() => setShowAIAssistant(true)}
              className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-6 shadow-lg hover:shadow-xl transition-all z-40 animate-pulse hover:scale-110"
              title="Ask AI Assistant"
            >
              <MessageSquare className="w-8 h-8" />
            </button>
          )}

          {/* AI 助手對話框 */}
          {showAIAssistant && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
                <div className="flex justify-between items-center p-4 border-b border-white/20">
                  <h3 className="text-xl font-bold text-white">{t('ai.title') || '🤖 AI Assistant'}</h3>
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="text-white/70 hover:text-white text-2xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <AIAssistant />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-blur text-center space-y-6 relative">
      {/* AI 助手按鈕 - 專注時浮動顯示 */}
      {isRunning && !showAIAssistant && (
        <button
          onClick={() => setShowAIAssistant(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-40 animate-pulse hover:scale-110"
          title={t('ai.askQuestion') || 'Ask AI Assistant'}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* AI 助手對話框 */}
      {showAIAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">{t('ai.title') || '🤖 AI Assistant'}</h3>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-white/70 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <AIAssistant />
            </div>
          </div>
        </div>
      )}



      {/* 標題 */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">🔥 {t('home.title')}</h2>
        <p className="text-white/80">{t('home.subtitle')}</p>
        
        {/* 時間自訂 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {!isEditingDuration ? (
            <>
              <span className="text-white/70 text-sm">{t('home.duration') || 'Duration'}:</span>
              <span className="text-white font-semibold text-lg">{customDuration} min</span>
              {!isRunning && !isCompleted && (
                <button
                  onClick={() => {
                    setIsEditingDuration(true);
                    setTempDuration(String(customDuration));
                  }}
                  className="ml-2 px-3 py-1 text-xs bg-purple-500/50 hover:bg-purple-500/70 text-white rounded-full transition-colors"
                >
                  {t('common.edit') || 'Edit'}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempDuration}
                onChange={(e) => setTempDuration(e.target.value)}
                min="1"
                max="120"
                className="w-16 px-2 py-1 text-center rounded-lg bg-white/90 text-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <span className="text-white/70">min</span>
              <button
                onClick={handleSaveDuration}
                className="px-3 py-1 text-xs bg-green-500/50 hover:bg-green-500/70 text-white rounded-full transition-colors"
              >
                {t('common.save') || 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditingDuration(false);
                  setTempDuration(String(customDuration));
                }}
                className="px-3 py-1 text-xs bg-gray-500/50 hover:bg-gray-500/70 text-white rounded-full transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 計時器顯示 */}
      <div className="space-y-4">
        {/* 專注時顯示寵物和勵志標語 */}
        {isRunning && currentPet && (
          <div className="mb-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col items-center gap-4">
              {/* 寵物圖示 */}
              <div className="animate-bounce">
                {petImageIndex >= getPetImageCandidates().length ? (
                  <div className="text-6xl">{getPetEmoji()}</div>
                ) : (
                  <img
                    src={getPetImageSrc()}
                    alt={currentPet.name}
                    className="w-24 h-24 object-contain drop-shadow-2xl"
                    draggable={false}
                    onError={handlePetImageError}
                  />
                )}
              </div>
              {/* 寵物名字 */}
              <div className="text-white font-bold text-xl">{currentPet.name}</div>
              {/* 勵志標語 */}
              <div className="text-white/90 text-lg text-center font-semibold bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
                {getMotivationalQuote()}
              </div>
            </div>
          </div>
        )}

        <div className="relative w-64 h-64 mx-auto">
          {/* 進度圓圈 */}
          <svg className="w-full h-full transform -rotate-90">
            {/* 背景圓 */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="8"
            />
            {/* 進度圓 */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke={progress > 0.66 ? '#FF6B6B' : '#FFE66D'}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress)}`}
              className="transition-all duration-300"
            />
          </svg>

          {/* 時間顯示 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-6xl font-bold ${getTimerColor()} transition-colors`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 狀態文字 */}
        <div className="text-white font-semibold">
          {isCompleted && (
            <div className="space-y-2">
              <p className="text-2xl">{t('home.completed')}</p>
              <p className="text-xl text-accent">{t('home.fireEarned', { fire: sessionFire })}</p>
            </div>
          )}
          {!isCompleted && isRunning && <p>{t('home.focusing')}</p>}
          {!isCompleted && !isRunning && <p>{t('home.ready')}</p>}
        </div>
      </div>

      {/* 控制按鍵 */}
      <div className="flex gap-4 justify-center">
        {!isCompleted && (
          <>
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t('home.start')}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="btn-primary flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                {t('home.pause')}
              </button>
            )}

            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('home.reset')}
            </button>
          </>
        )}

        {isCompleted && (
          <button onClick={handleReset} className="btn-primary flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            {t('home.startNewRound')}
          </button>
        )}
      </div>

      {/* 4 個番茄鐘提示 */}
      <div className="border-t border-white/20 pt-4">
        <p className="text-sm text-white/70">
          {t('home.tip')}
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
