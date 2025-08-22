import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'FCFA' | 'EURO';

const STORAGE_KEY = 'app.currency';

// Detect currency from AsyncStorage first, then default to FCFA
export const detectCurrency = async (): Promise<Currency> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'FCFA' || stored === 'EURO')) {
      return stored as Currency;
    }
  } catch {}
  return 'FCFA'; // Default currency
};

export const setCurrency = async (currency: Currency) => {
  await AsyncStorage.setItem(STORAGE_KEY, currency);
};

export const getCurrency = async (): Promise<Currency> => {
  return await detectCurrency();
};
