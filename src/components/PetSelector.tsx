import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pet, PetType } from '../types';

interface PetSelectorProps {
  onSelectPet: (pet: Pet) => void;
  existingPets: Pet[];
}

export const PetSelector: React.FC<PetSelectorProps> = ({ onSelectPet, existingPets }) => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<PetType>('cat');
  const [petName, setPetName] = useState('');

  const petOptions: Array<{ type: PetType; emoji: string; labelKey: string; descKey: string }> =
    [
      {
        type: 'cat',
        emoji: '🐱',
        labelKey: 'petSelector.cats.name',
        descKey: 'petSelector.cats.description',
      },
      {
        type: 'dog',
        emoji: '🐕',
        labelKey: 'petSelector.dogs.name',
        descKey: 'petSelector.dogs.description',
      },
      {
        type: 'fox',
        emoji: '🦊',
        labelKey: 'petSelector.foxes.name',
        descKey: 'petSelector.foxes.description',
      },
    ];

  const handleCreatePet = () => {
    if (!petName.trim()) {
      alert(t('petSelector.namePlaceholder'));
      return;
    }

    const newPet: Pet = {
      id: Date.now().toString(),
      type: selectedType,
      name: petName,
      level: 1,
      experience: 0,
      hunger: 30,
      happiness: 80,
      energy: 100,
      lastFed: new Date(),
      lastPetted: new Date(),
      items: [],
    };

    onSelectPet(newPet);
    setPetName('');
  };

  const selectedPet = petOptions.find((p) => p.type === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/30 shadow-2xl">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">{t('petSelector.title')}</h1>
          <p className="text-white/80 text-lg">{t('petSelector.subtitle')}</p>
        </div>

        {/* 寵物選項 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {petOptions.map((pet) => (
            <button
              key={pet.type}
              onClick={() => setSelectedType(pet.type)}
              className={`p-6 rounded-2xl transition-all transform hover:scale-105 ${
                selectedType === pet.type
                  ? 'bg-accent text-dark shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="text-5xl mb-2">{pet.emoji}</div>
              <h3 className="font-bold text-lg mb-1">{t(pet.labelKey)}</h3>
              <p className="text-xs opacity-80">{t(pet.descKey)}</p>
            </button>
          ))}
        </div>

        {/* 大預覽 */}
        <div className="bg-white/10 rounded-2xl p-8 mb-8 border border-white/20 text-center">
          <div className="text-8xl mb-4">{selectedPet?.emoji}</div>
          <p className="text-white/80 text-lg">
            {selectedPet && t(selectedPet.labelKey)}
          </p>
        </div>

        {/* 寵物名字輸入 */}
        <div className="mb-8">
          <label className="block text-white font-bold mb-2">{t('petSelector.petName')}</label>
          <input
            type="text"
            placeholder={t('petSelector.placeholder')}
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePet()}
            maxLength={20}
            className="w-full px-6 py-3 rounded-xl bg-white/90 text-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent font-semibold text-lg"
          />
          <p className="text-white/60 text-sm mt-2">{petName.length}/20</p>
        </div>

        {/* 已有寵物提示 */}
        {existingPets.length > 0 && (
          <div className="bg-blue-400/20 rounded-xl p-4 mb-8 border border-blue-400/30">
            <p className="text-white/90 font-semibold">
              {t('petSelector.existingPets', { count: existingPets.length })}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {existingPets.map((pet) => (
                <span
                  key={pet.id}
                  className="bg-white/20 px-3 py-1 rounded-full text-white text-sm"
                >
                  {pet.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 開始按鍵 */}
        <button
          onClick={handleCreatePet}
          disabled={!petName.trim()}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
        >
          {t('petSelector.startAdventure')}
        </button>

        {/* 底部信息 */}
        <p className="text-white/70 text-center text-sm mt-6">{t('petSelector.tip')}</p>
      </div>
    </div>
  );
};

export default PetSelector;

