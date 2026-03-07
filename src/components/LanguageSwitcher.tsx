import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh-HK', label: '粵語', flag: '🇭🇰' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('petTimer_language', languageCode);
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full p-1.5 sm:p-2 border border-white/20">
      <Globe className="hidden sm:block w-5 h-5 text-white" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 sm:px-3 py-1 rounded-full text-sm font-semibold transition-all ${
              i18n.language === lang.code
                ? 'bg-accent text-dark'
                : 'hover:bg-white/20 text-white/70'
            }`}
            title={lang.label}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
