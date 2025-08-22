import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Card, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const CurrencyOption = ({ currencyOption }: { currencyOption: typeof currencies[0] }) => (
    <TouchableOpacity
      style={[styles.currencyOption, { borderColor: theme.colors.outline }]}
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
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('common.loading')}
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('settings.currency.selectCurrency')}
        </Text>
        
        <View style={styles.currencyList}>
          {currencies.map((currencyOption) => (
            <CurrencyOption key={currencyOption.code} currencyOption={currencyOption} />
          ))}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
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
    gap: 12,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
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
});

export default CurrencySettingsScreen;
