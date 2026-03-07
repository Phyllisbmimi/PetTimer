import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';

export const ThemeSelector: React.FC = () => {
  const { t } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const themes = [
    {
      id: 'minecraft' as const,
      name: t('themes.minecraft'),
      icon: '🟫',
      preview: 'bg-gradient-to-br from-green-600 to-amber-700',
      description: t('themes.minecraftDesc'),
    },
    {
      id: 'naruto' as const,
      name: t('themes.naruto'),
      icon: '🍥',
      preview: 'bg-gradient-to-br from-orange-500 to-red-600',
      description: t('themes.narutoDesc'),
    },
    {
      id: 'haikyuu' as const,
      name: t('themes.haikyuu'),
      icon: '🏐',
      preview: 'bg-gradient-to-br from-orange-500 to-slate-800',
      description: t('themes.haikyuuDesc'),
    },
    {
      id: 'fairyTail' as const,
      name: t('themes.fairyTail'),
      icon: '🐉',
      preview: 'bg-gradient-to-br from-red-600 to-sky-500',
      description: t('themes.fairyTailDesc'),
    },
    {
      id: 'minimalDark' as const,
      name: t('themes.minimalDark'),
      icon: '',
      preview: 'bg-black',
      description: t('themes.minimalDarkDesc'),
    },
    {
      id: 'minimalLight' as const,
      name: t('themes.minimalLight'),
      icon: '',
      preview: 'bg-white',
      description: t('themes.minimalLightDesc'),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">{t('themes.selectTheme')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
            className={`p-4 rounded-2xl border-4 transition-all duration-300 ${
              theme === themeOption.id
                ? 'border-white shadow-2xl scale-105'
                : 'border-transparent hover:border-white/50 hover:scale-102'
            }`}
          >
            <div className={`${themeOption.preview} rounded-xl p-6 mb-3 h-32 flex items-center justify-center`}>
              <span
                className={`text-6xl ${
                  themeOption.id === 'minimalLight'
                    ? 'text-black'
                    : themeOption.id === 'minimalDark'
                      ? 'text-red-500'
                      : 'text-white'
                }`}
              >
                {themeOption.icon}
              </span>
            </div>
            <h4 className="font-bold text-lg text-white mb-1">{themeOption.name}</h4>
            <p className="text-sm text-white/80">{themeOption.description}</p>
            {theme === themeOption.id && (
              <div className="mt-2 text-white font-bold">✓ {t('themes.selected')}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
