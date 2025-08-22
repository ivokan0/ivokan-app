import { useState, useEffect } from 'react';
import { getCurrency, setCurrency, type Currency } from '../services/currency';

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<Currency>('FCFA');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const storedCurrency = await getCurrency();
        setCurrencyState(storedCurrency);
      } catch (error) {
        // Erreur silencieuse lors du chargement de la devise
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  const updateCurrency = async (newCurrency: Currency) => {
    try {
      await setCurrency(newCurrency);
      setCurrencyState(newCurrency);
    } catch (error) {
      throw error;
    }
  };

  const formatCurrency = (amount: number): string => {
    if (currency === 'FCFA') {
      return `${amount.toLocaleString('fr-FR')} CFA`;
    } else {
      return `${amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
    }
  };

  return {
    currency,
    updateCurrency,
    formatCurrency,
    isLoading,
  };
};
