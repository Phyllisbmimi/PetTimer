import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePomodoro } from '../hooks';

interface TimerProps {
  duration?: number;
  onComplete?: () => void;
  goalId?: string;
}

export const PomodoroTimer: React.FC<TimerProps> = ({
  duration = 25,
  onComplete,
  goalId: _goalId,
}) => {
  const { t } = useTranslation();
  const [customDuration, setCustomDuration] = useState(duration);
  const [tempDuration, setTempDuration] = useState(String(duration));
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const { minutes, seconds, isRunning, isCompleted, start, pause, reset, progress } =
    usePomodoro(customDuration, onComplete);
  const [sessionFire, setSessionFire] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      // 計算獲得的火焰
      // 完成一個番茄鐘 = 1 火焰
      setSessionFire(1);
    }
  }, [isCompleted]);

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

  return (
    <div className="card-blur text-center space-y-6">
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
                onClick={start}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {t('home.start')}
              </button>
            ) : (
              <button
                onClick={pause}
                className="btn-primary flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                {t('home.pause')}
              </button>
            )}

            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              {t('home.reset')}
            </button>
          </>
        )}

        {isCompleted && (
          <button onClick={reset} className="btn-primary flex items-center gap-2">
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
