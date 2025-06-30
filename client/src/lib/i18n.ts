import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enCommon from '../locales/en/common.json';
import ptCommon from '../locales/pt/common.json';
import esCommon from '../locales/es/common.json';
import deCommon from '../locales/de/common.json';
import itCommon from '../locales/it/common.json';

// Supported languages configuration
export const supportedLanguages = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    code: 'en'
  },
  pt: {
    name: 'Português',
    flag: '🇧🇷',
    code: 'pt'
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    code: 'es'
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    code: 'de'
  },
  it: {
    name: 'Italiano',
    flag: '🇮🇹',
    code: 'it'
  }
};

// Resources configuration
const resources = {
  en: {
    common: enCommon
  },
  pt: {
    common: ptCommon
  },
  es: {
    common: esCommon
  },
  de: {
    common: deCommon
  },
  it: {
    common: itCommon
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    
    // Default language
    fallbackLng: 'en',
    
    // Default namespace
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      // Available detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // Optional: exclude certain keys from detection
      excludeCacheFor: ['cimode'],
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // React-specific options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
  });

export default i18n;