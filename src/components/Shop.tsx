import React, { useState } from 'react';
import { ShoppingCart, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PetItem } from '../types';

interface ShopProps {
  coins: number;
  fire: number;
  onBuy: (item: PetItem, cost: number) => void;
}

export const Shop: React.FC<ShopProps> = ({ coins, fire, onBuy }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'food' | 'clothing' | 'toy'>('food');

  const foodItems: Array<PetItem & { cost: number; emoji: string; nameKey: string }> = [
    { id: '1', type: 'food', name: 'bone', nameKey: 'bone', rarity: 'common', cost: 10, emoji: '🦴' },
    { id: '2', type: 'food', name: 'fish', nameKey: 'fish', rarity: 'common', cost: 15, emoji: '🐟' },
    { id: '3', type: 'food', name: 'cake', nameKey: 'cake', rarity: 'rare', cost: 50, emoji: '🎂' },
    { id: '4', type: 'food', name: 'sushi', nameKey: 'sushi', rarity: 'epic', cost: 100, emoji: '🍣' },
    { id: '11', type: 'food', name: 'carrot', nameKey: 'carrot', rarity: 'common', cost: 12, emoji: '🥕' },
    { id: '12', type: 'food', name: 'donut', nameKey: 'donut', rarity: 'rare', cost: 38, emoji: '🍩' },
    { id: '13', type: 'food', name: 'milk', nameKey: 'milk', rarity: 'common', cost: 18, emoji: '🥛' },
    { id: '14', type: 'food', name: 'honey', nameKey: 'honey', rarity: 'rare', cost: 55, emoji: '🍯' },
    { id: '15', type: 'food', name: 'royalMeal', nameKey: 'royalMeal', rarity: 'epic', cost: 180, emoji: '🍱' },
  ];

  const clothingItems: Array<PetItem & { cost: number; emoji: string; nameKey: string }> = [
    { id: '5', type: 'clothing', name: 'hat', nameKey: 'hat', rarity: 'common', cost: 20, emoji: '🎩' },
    { id: '6', type: 'clothing', name: 'cloak', nameKey: 'cloak', rarity: 'rare', cost: 60, emoji: '🧥' },
    { id: '7', type: 'clothing', name: 'crown', nameKey: 'crown', rarity: 'epic', cost: 150, emoji: '👑' },
    { id: '16', type: 'clothing', name: 'bow', nameKey: 'bow', rarity: 'common', cost: 22, emoji: '🎀' },
    { id: '17', type: 'clothing', name: 'sunglasses', nameKey: 'sunglasses', rarity: 'rare', cost: 48, emoji: '🕶️' },
    { id: '18', type: 'clothing', name: 'scarf', nameKey: 'scarf', rarity: 'common', cost: 25, emoji: '🧣' },
    { id: '19', type: 'clothing', name: 'superhero', nameKey: 'superhero', rarity: 'epic', cost: 220, emoji: '🦸' },
    { id: '20', type: 'clothing', name: 'backpack', nameKey: 'backpack', rarity: 'rare', cost: 70, emoji: '🎒' },
  ];

  const toyItems: Array<PetItem & { cost: number; emoji: string; nameKey: string }> = [
    { id: '8', type: 'toy', name: 'ball', nameKey: 'ball', rarity: 'common', cost: 15, emoji: '🎾' },
    { id: '9', type: 'toy', name: 'yarn', nameKey: 'yarn', rarity: 'common', cost: 10, emoji: '🧶' },
    { id: '10', type: 'toy', name: 'frisbee', nameKey: 'frisbee', rarity: 'rare', cost: 40, emoji: '🥏' },
    { id: '21', type: 'toy', name: 'duck', nameKey: 'duck', rarity: 'common', cost: 16, emoji: '🦆' },
    { id: '22', type: 'toy', name: 'puzzle', nameKey: 'puzzle', rarity: 'rare', cost: 52, emoji: '🧩' },
    { id: '23', type: 'toy', name: 'piano', nameKey: 'piano', rarity: 'epic', cost: 145, emoji: '🎹' },
    { id: '24', type: 'toy', name: 'car', nameKey: 'car', rarity: 'rare', cost: 80, emoji: '🚗' },
    { id: '25', type: 'toy', name: 'wand', nameKey: 'wand', rarity: 'epic', cost: 190, emoji: '🪄' },
  ];

  let items: Array<PetItem & { cost: number; emoji: string; nameKey: string }> = [];
  if (selectedTab === 'food') items = foodItems;
  else if (selectedTab === 'clothing') items = clothingItems;
  else items = toyItems;

  const tabs: Array<{ id: 'food' | 'clothing' | 'toy'; label: string; emoji: string }> = [
    { id: 'food', label: t('shop.food'), emoji: '' },
    { id: 'clothing', label: t('shop.clothing'), emoji: '' },
    { id: 'toy', label: t('shop.toys'), emoji: '' },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-400';
      case 'rare':
        return 'bg-blue-400';
      case 'epic':
        return 'bg-purple-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getRarityLabel = (rarity: string) => {
    return t(`shop.rarity.${rarity}`);
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="card-blur">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          {t('shop.title')}
        </h2>
        <p className="text-white/60 mt-2">{t('shop.subtitle')}</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <span>🔥</span>
          <span className="text-white font-bold">{fire}</span>
        </div>
      </div>

      {/* 標籤 */}
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              selectedTab === tab.id
                ? 'bg-accent text-dark shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 商品網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="card-blur hover:border-white/50 transition-all cursor-pointer group"
          >
            <div className="text-6xl text-center mb-3 group-hover:scale-110 transition-transform">
              {item.emoji}
            </div>

            <h3 className="text-white font-bold text-lg text-center mb-1">
              {t(`shop.items.${item.nameKey}`)}
            </h3>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span className={`${getRarityColor(item.rarity)} text-white px-2 py-1 rounded text-xs font-bold`}>
                {getRarityLabel(item.rarity)}
              </span>
            </div>

            <p className="text-center text-accent font-bold text-lg mb-4">🪙 {item.cost}</p>

            <button
              onClick={() => onBuy(item, item.cost)}
              disabled={coins < item.cost}
              className={`w-full py-2 rounded-lg font-bold transition-all ${
                coins >= item.cost
                  ? 'bg-accent text-dark hover:shadow-lg active:scale-95'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {coins >= item.cost ? t('shop.buy') : t('shop.insufficientCoins')}
            </button>
          </div>
        ))}
      </div>

      {/* 提示 */}
      <div className="card-blur text-center">
        <Gift className="w-8 h-8 mx-auto mb-2 text-accent" />
        <p className="text-white/80">{t('shop.tip')}</p>
      </div>
    </div>
  );
};

export default Shop;
