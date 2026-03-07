import React, { useState } from 'react';
import { Heart, Zap, Leaf, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pet } from '../types';
import { usePetReaction } from '../hooks';
import { useAppStore } from '../store/appStore';

interface PetCardProps {
  pet: Pet;
  onFeed: () => void;
  onPet: () => void;
}

export const PetCard: React.FC<PetCardProps> = ({ pet, onFeed, onPet }) => {
  const { t } = useTranslation();
  const { reaction, isReacting, showReaction } = usePetReaction();
  const [isAnimating, setIsAnimating] = useState(false);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const toggleSound = useAppStore((state) => state.toggleSound);

  const getPetStage = (level: number) => {
    if (level <= 3) return 'child';
    if (level <= 7) return 'teen';
    return 'adult';
  };

  const stage = getPetStage(pet.level);
  const currentLevelExp = pet.experience % 100;

  const playPetSound = (type: string) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      const now = audioContext.currentTime;

      if (type === 'dog') {
        oscillator.frequency.setValueAtTime(420, now);
        oscillator.frequency.exponentialRampToValueAtTime(250, now + 0.2);
      } else if (type === 'cat') {
        oscillator.frequency.setValueAtTime(620, now);
        oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      } else {
        oscillator.frequency.setValueAtTime(700, now);
        oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.16);
      }

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      oscillator.type = 'triangle';
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.24);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  };

  const getPetVisual = (type: string, stage: string) => {
    // 根據類型和階段返回不同外觀
    if (type === 'dog') {
      if (stage === 'child') return { face: '🐶', accessory: '', body: '🟤', paw: '🐾', emoji: '👶' };
      if (stage === 'teen') return { face: '🐶', accessory: '🎓', body: '🟤', paw: '🐾', emoji: '🧒' };
      return { face: '🐶', accessory: '👑', body: '🟤', paw: '🐾', emoji: '🦸' };
    }
    if (type === 'cat') {
      if (stage === 'child') return { face: '🐱', accessory: '', body: '🟡', paw: '🐾', emoji: '👶' };
      if (stage === 'teen') return { face: '🐱', accessory: '🎀', body: '🟡', paw: '🐾', emoji: '🧒' };
      return { face: '🐱', accessory: '💎', body: '🟡', paw: '🐾', emoji: '✨' };
    }
    // fox
    if (stage === 'child') return { face: '🦊', accessory: '', body: '🟠', paw: '🐾', emoji: '👶' };
    if (stage === 'teen') return { face: '🦊', accessory: '🧣', body: '🟠', paw: '🐾', emoji: '🧒' };
    return { face: '🦊', accessory: '🎩', body: '🟠', paw: '🐾', emoji: '🌟' };
  };

  const handlePet = () => {
    setIsAnimating(true);
    showReaction('happy');
    playPetSound(pet.type);
    onPet();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getStatus = () => {
    if (pet.hunger > 75) return 'hungry';
    if (pet.happiness < 30) return 'sad';
    if (pet.energy < 20) return 'sleepy';
    return 'happy';
  };

  const visual = getPetVisual(pet.type, stage);

  return (
    <div className="pet-card bg-gradient-to-br from-yellow-100 to-pink-100 p-8 text-center">
      {/* 音量控制按鈕 */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors z-10"
        title={soundEnabled ? t('settings.soundOn') : t('settings.soundOff')}
      >
        {soundEnabled ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
      </button>

      <div className="relative">
        {/* 寵物主體（幼年有更小身形） */}
        <div
          className={`transition-transform duration-300 select-none ${
            isAnimating ? 'animate-pet-bounce' : ''
          }`}
          onClick={handlePet}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex flex-col items-center gap-2">
            {/* 階段標誌 */}
            {visual.emoji && (
              <div className="text-2xl mb-1 opacity-70">
                {visual.emoji}
              </div>
            )}
            
            {/* 主臉部 + 配飾 */}
            <div className="relative">
              <div className={`${stage === 'child' ? 'text-6xl' : stage === 'teen' ? 'text-7xl' : 'text-8xl'}`}>
                {visual.face}
              </div>
              {visual.accessory && (
                <div className="absolute -top-2 -right-2 text-3xl animate-pulse">
                  {visual.accessory}
                </div>
              )}
            </div>

            {/* 身體 */}
            <div
              className={`rounded-full ${stage === 'child' ? 'w-16 h-14' : stage === 'teen' ? 'w-20 h-16' : 'w-24 h-20'} flex items-center justify-center shadow-md border-2 border-white/70`}
              style={{
                background:
                  pet.type === 'dog'
                    ? 'linear-gradient(135deg, #d6b07a, #b98956)'
                    : pet.type === 'cat'
                      ? 'linear-gradient(135deg, #f2d37d, #f0ba61)'
                      : 'linear-gradient(135deg, #ffae73, #ff8a4c)',
              }}
            >
              <span className="text-lg">{visual.paw}</span>
            </div>
          </div>
        </div>

        {/* 反應氣泡 */}
        {isReacting && (
          <div className="absolute top-0 right-0 bg-white rounded-full px-3 py-1 text-sm shadow-lg animate-bounce">
            {reaction}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-3xl font-bold text-dark">{pet.name}</h2>
        <p className="text-sm text-gray-600">
          {t('pet.level', { level: pet.level })} | {t('pet.experience', { exp: pet.experience })}
        </p>
        <p className="text-xs font-semibold text-purple-600">
          {t('pet.stage')}: {t(`pet.stages.${stage}`)}
        </p>

        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{t('pet.nextLevel')}</span>
            <span>{currentLevelExp}/100 EXP</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div className="bg-purple-500 h-full transition-all" style={{ width: `${currentLevelExp}%` }} />
          </div>
        </div>

        {/* 狀態條 */}
        <div className="space-y-3 mt-6">
          {/* 飢餓 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Leaf className="w-4 h-4" />
                {t('pet.hunger')}
              </div>
              <span className="text-xs font-bold">{pet.hunger}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-orange-400 h-full transition-all"
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* 幸福 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Heart className="w-4 h-4" />
                {t('pet.happiness')}
              </div>
              <span className="text-xs font-bold">{pet.happiness}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-pink-400 h-full transition-all"
                style={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>

          {/* 能量 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                {t('pet.energy')}
              </div>
              <span className="text-xs font-bold">{pet.energy}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-yellow-400 h-full transition-all"
                style={{ width: `${pet.energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* 按鍵 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onFeed}
            className="flex-1 btn-primary"
          >
            {t('pet.feed')}
          </button>
          <button
            onClick={handlePet}
            className="flex-1 btn-secondary"
          >
            {t('pet.pet')}
          </button>
        </div>

        {/* 狀態標籤 */}
        <div className="mt-4 text-2xl">
          {getStatus() === 'happy' && '😄'}
          {getStatus() === 'hungry' && '😋'}
          {getStatus() === 'sad' && '😢'}
          {getStatus() === 'sleepy' && '😴'}
        </div>
      </div>
    </div>
  );
};

export default PetCard;
