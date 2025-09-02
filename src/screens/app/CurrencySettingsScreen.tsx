import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, RadioButton, Divider } from 'react-native-paper';

import { useCurrency } from '../../hooks/useCurrency';

const CurrencySettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currency, updateCurrency, isLoading } = useCurrency();

  const currencies = [
    { code: 'FCFA' as const, name: t('settings.currency.fcfa'), symbol: 'CFA' },
    { code: 'EURO' as const, name: t('settings.currency.euro'), symbol: '€' },
  ];

  const handleCurrencyChange = async (currencyCode: 'FCFA' | 'EURO') => {
    try {
      await updateCurrency(currencyCode);
    } catch (error) {
      // Erreur silencieuse lors du changement de devise
    }
  };

  const CurrencyOption = ({ currencyOption, isLast }: { currencyOption: typeof currencies[0]; isLast: boolean }) => (
    <>
      <TouchableOpacity
        style={styles.currencyOption}
        onPress={() => handleCurrencyChange(currencyOption.code)}
      >
        <View style={styles.currencyInfo}>
          <Text style={[styles.currencySymbol, { color: theme.colors.primary }]}>
            {currencyOption.symbol}
          </Text>
          <Text style={[styles.currencyName, { color: theme.colors.onSurface }]}>
            {currencyOption.name}
          </Text>
        </View>
        <RadioButton
          value={currencyOption.code}
          status={currency === currencyOption.code ? 'checked' : 'unchecked'}
          onPress={() => handleCurrencyChange(currencyOption.code)}
        />
      </TouchableOpacity>
      {!isLast && <Divider style={styles.divider} />}
    </>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>

        
        <View style={styles.currencyList}>
          {currencies.map((currencyOption, index) => (
            <CurrencyOption 
              key={currencyOption.code} 
              currencyOption={currencyOption} 
              isLast={index === currencies.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  content: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 24,
  },
  currencyList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginRight: 12,
  },
  currencyName: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  divider: {
    marginHorizontal: 16,
  },
});

export default CurrencySettingsScreen;
