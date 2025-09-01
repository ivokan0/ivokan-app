import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useCurrency } from '../hooks/useCurrency';

interface TutorEarningsBalanceProps {
  summary: {
    balance: number;
    pendingAmount: number;
    refundedAmount: number;
  } | null;
  withdrawalSummary?: {
    pendingWithdrawals: number;
  } | null;
  loading?: boolean;
  onWithdrawPress?: () => void;
}

const TutorEarningsBalance: React.FC<TutorEarningsBalanceProps> = ({ 
  summary, 
  withdrawalSummary, 
  loading = false, 
  onWithdrawPress 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatCurrency } = useCurrency();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.earningsBalance')}
        </Text>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading balance...
          </Text>
        </View>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.earningsBalance')}
        </Text>
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons 
            name="cash-remove" 
            size={48} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsNoData')}
          </Text>
          <Text style={[styles.noDataDescription, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsNoDataDescription')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('tutor.earningsBalance')}
      </Text>
      
      <View style={styles.balanceGrid}>
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons 
            name="cash-multiple" 
            size={24} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.balanceAmount, { color: theme.colors.onSurface }]}>
            {formatCurrency(summary.balance)}
          </Text>
          <Text style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsBalance')}
          </Text>
        </View>
        
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={24} 
            color="#FFA726" 
          />
          <Text style={[styles.balanceAmount, { color: theme.colors.onSurface }]}>
            {formatCurrency(summary.pendingAmount)}
          </Text>
          <Text style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsPending')}
          </Text>
        </View>
        
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons 
            name="bank-transfer" 
            size={24} 
            color="#9C27B0" 
          />
          <Text style={[styles.balanceAmount, { color: theme.colors.onSurface }]}>
            {formatCurrency(withdrawalSummary?.pendingWithdrawals || 0)}
          </Text>
          <Text style={[styles.balanceLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.pendingWithdrawals')}
          </Text>
        </View>
      </View>

      {/* Withdraw Button */}
      {onWithdrawPress && (
        <TouchableOpacity 
          style={[styles.withdrawButton, { backgroundColor: theme.colors.primary }]}
          onPress={onWithdrawPress}
        >
          <MaterialCommunityIcons 
            name="bank-transfer" 
            size={20} 
            color="white" 
          />
          <Text style={styles.withdrawButtonText}>
            {t('tutor.requestWithdrawal')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginTop: 8,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 8,
  },
});

export default TutorEarningsBalance;
