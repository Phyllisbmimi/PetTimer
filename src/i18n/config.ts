import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import zhHKTranslation from './locales/zh-HK.json';
import zhCNTranslation from './locales/zh-CN.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  'zh-HK': {
    translation: zhHKTranslation,
  },
  'zh-CN': {
    translation: zhCNTranslation,
  },
};

// 從 localStorage 獲取保存的語言，或使用瀏覽器語言，默認為英文
const getSavedLanguage = () => {
  const saved = localStorage.getItem('petTimer_language');
  if (saved) return saved;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh-hk')) return 'zh-HK';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('en')) return 'en';
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
