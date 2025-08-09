import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import fr from './fr.json';

const STORAGE_KEY = 'app.language';

// Detect language from AsyncStorage first, then device locale
export const detectLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {}
  const device = Localization.getLocales?.()[0]?.languageCode ?? 'en';
  return device === 'fr' ? 'fr' : 'en';
};

export const setLanguage = async (lng: 'en' | 'fr') => {
  await AsyncStorage.setItem(STORAGE_KEY, lng);
  await i18n.changeLanguage(lng);
};

// Initialize immediately so translations work on the very first render
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export const setupI18n = async () => {
  const lng = await detectLanguage();
  await i18n.changeLanguage(lng);
};

export default i18n;


