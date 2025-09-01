import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useCurrency } from '../hooks/useCurrency';
import { EarningWithDetails, WithdrawalRequestWithDetails } from '../types/database';
import Avatar from './ui/Avatar';

type TabType = 'earnings' | 'withdrawals';

interface WithdrawalHistoryProps {
  earnings: EarningWithDetails[];
  withdrawals: WithdrawalRequestWithDetails[];
  loading?: boolean;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ 
  earnings, 
  withdrawals, 
  loading = false 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  
  const [selectedTab, setSelectedTab] = useState<TabType>('earnings');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'earnings', label: t('tutor.earnings'), icon: 'cash-multiple' },
    { key: 'withdrawals', label: t('tutor.withdrawals'), icon: 'bank-transfer' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'done': return '#66BB6A';
      case 'rejected': return '#EF5350';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'done': return 'check-circle-outline';
      case 'rejected': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStudentDisplayName = (earning: EarningWithDetails) => {
    if (earning.student) {
      const firstName = earning.student.first_name || '';
      const lastName = earning.student.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Student';
    }
    return `Student ${earning.student_id.slice(0, 8)}`;
  };

  const getLanguageName = (earning: EarningWithDetails) => {
    if (earning.subscription?.language) {
      return earning.subscription.language.name;
    }
    return null;
  };

  const handleDownloadProof = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.history')}
        </Text>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading history...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('tutor.history')}
      </Text>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && { 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary 
              }
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <MaterialCommunityIcons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
            />
            <Text style={[
              styles.tabText,
              { color: selectedTab === tab.key ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content based on selected tab */}
      {selectedTab === 'earnings' ? (
        <EarningsTab earnings={earnings} />
      ) : (
        <WithdrawalsTab withdrawals={withdrawals} />
      )}
    </View>
  );
};

// Earnings Tab Component
const EarningsTab: React.FC<{ earnings: EarningWithDetails[] }> = ({ earnings }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'gained': return '#66BB6A';
      case 'refunded': return '#EF5350';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'gained': return 'check-circle-outline';
      case 'refunded': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trial': return 'star-outline';
      case 'plan': return 'calendar-check';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStudentDisplayName = (earning: EarningWithDetails) => {
    if (earning.student) {
      const firstName = earning.student.first_name || '';
      const lastName = earning.student.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Student';
    }
    return `Student ${earning.student_id.slice(0, 8)}`;
  };

  const getLanguageName = (earning: EarningWithDetails) => {
    if (earning.subscription?.language) {
      return earning.subscription.language.name;
    }
    return null;
  };

  if (earnings.length === 0) {
    return (
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
    );
  }

  return (
    <View style={styles.earningsList}>
      {earnings.map((earning) => (
        <View key={earning.id} style={styles.earningItem}>
          {/* Student Info Header */}
          <View style={styles.studentInfoHeader}>
            <View style={styles.studentInfo}>
              <Avatar 
                size={40}
                avatarUrl={earning.student?.avatar_url || null}
                firstName={earning.student?.first_name || 'Student'}
                lastName={earning.student?.last_name || ''}
              />
              <View style={styles.studentDetails}>
                <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
                  {getStudentDisplayName(earning)}
                </Text>
                <View style={styles.studentInfoRow}>
                  <Text style={[styles.lessonType, { color: theme.colors.onSurfaceVariant }]}>
                    {earning.type === 'trial' ? t('tutor.earningsTrial') : t('tutor.earningsPlan')}
                  </Text>
                  {getLanguageName(earning) && (
                    <Text style={[styles.languageInfo, { color: theme.colors.onSurfaceVariant }]}>
                      • {getLanguageName(earning)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.earningStatus}>
              <MaterialCommunityIcons 
                name={getStatusIcon(earning.status)} 
                size={16} 
                color={getStatusColor(earning.status)} 
              />
              <Text style={[styles.earningStatusText, { color: getStatusColor(earning.status) }]}>
                {t(`tutor.earnings${earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}`)}
              </Text>
            </View>
          </View>

          {/* Earning Type and Amounts */}
          <View style={styles.earningDetails}>
            <View style={styles.earningType}>
              <MaterialCommunityIcons 
                name={getTypeIcon(earning.type)} 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text style={[styles.earningTypeText, { color: theme.colors.onSurface }]}>
                {earning.type === 'trial' ? t('tutor.earningsTrial') : t('tutor.earningsPlan')}
              </Text>
            </View>
            
            <View style={styles.earningAmounts}>
              <Text style={[styles.earningNetAmount, { color: theme.colors.onSurface }]}>
                {formatCurrency(earning.net_amount)}
              </Text>
              <Text style={[styles.earningGrossAmount, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutor.earningsGross')}: {formatCurrency(earning.gross_amount)}
              </Text>
            </View>
          </View>
          
          {/* Date */}
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.earningDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(earning.created_at)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Withdrawals Tab Component
const WithdrawalsTab: React.FC<{ withdrawals: WithdrawalRequestWithDetails[] }> = ({ withdrawals }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'done': return '#66BB6A';
      case 'rejected': return '#EF5350';
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'done': return 'check-circle-outline';
      case 'rejected': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDownloadProof = (url: string) => {
    Linking.openURL(url);
  };

  if (withdrawals.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <MaterialCommunityIcons 
          name="bank-off" 
          size={48} 
          color={theme.colors.onSurfaceVariant} 
        />
        <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>
          {t('tutor.withdrawalsNoData')}
        </Text>
        <Text style={[styles.noDataDescription, { color: theme.colors.onSurfaceVariant }]}>
          {t('tutor.withdrawalsNoDataDescription')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.withdrawalsList}>
      {withdrawals.map((withdrawal) => (
        <View key={withdrawal.id} style={styles.withdrawalItem}>
          {/* Header with Status */}
          <View style={styles.withdrawalHeader}>
            <View style={styles.withdrawalInfo}>
              <MaterialCommunityIcons 
                name="bank-transfer" 
                size={24} 
                color={theme.colors.primary} 
              />
              <View style={styles.withdrawalDetails}>
                <Text style={[styles.withdrawalAmount, { color: theme.colors.onSurface }]}>
                  {formatCurrency(withdrawal.amount)}
                </Text>
                <Text style={[styles.withdrawalMethod, { color: theme.colors.onSurfaceVariant }]}>
                  {withdrawal.payment_method?.payment_type.replace('_', ' ') || 'Unknown Method'}
                </Text>
              </View>
            </View>
            
            <View style={styles.withdrawalStatus}>
              <MaterialCommunityIcons 
                name={getStatusIcon(withdrawal.status)} 
                size={16} 
                color={getStatusColor(withdrawal.status)} 
              />
              <Text style={[styles.withdrawalStatusText, { color: getStatusColor(withdrawal.status) }]}>
                {t(`tutor.withdrawal${withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}`)}
              </Text>
            </View>
          </View>

          {/* Payment Method Details */}
          {withdrawal.payment_method && (
            <View style={styles.paymentMethodDetails}>
              <Text style={[styles.paymentMethodLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutor.accountDetails')}:
              </Text>
              <Text style={[styles.paymentMethodText, { color: theme.colors.onSurface }]}>
                {withdrawal.payment_method.account_name} - {withdrawal.payment_method.account_number}
              </Text>
            </View>
          )}

          {/* Notes */}
          {withdrawal.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.notesLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutor.notes')}:
              </Text>
              <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>
                {withdrawal.notes}
              </Text>
            </View>
          )}

          {/* Payment Proof */}
          {withdrawal.payment_proof_url && (
            <View style={styles.proofContainer}>
              <Text style={[styles.proofLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutor.paymentProof')}:
              </Text>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleDownloadProof(withdrawal.payment_proof_url!)}
              >
                <MaterialCommunityIcons 
                  name="download" 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.downloadButtonText}>
                  {t('tutor.downloadProof')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Date */}
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={16} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text style={[styles.withdrawalDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(withdrawal.created_at)}
            </Text>
          </View>
        </View>
      ))}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
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
  // Earnings Tab Styles
  earningsList: {
    gap: 12,
  },
  earningItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  studentInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  lessonType: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  languageInfo: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 4,
  },
  earningStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  earningStatusText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 4,
  },
  earningDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  earningType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningTypeText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 8,
  },
  earningAmounts: {
    alignItems: 'flex-end',
  },
  earningNetAmount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  earningGrossAmount: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningDate: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 6,
  },
  // Withdrawals Tab Styles
  withdrawalsList: {
    gap: 12,
  },
  withdrawalItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  withdrawalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  withdrawalDetails: {
    marginLeft: 12,
    flex: 1,
  },
  withdrawalAmount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  withdrawalMethod: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  withdrawalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  withdrawalStatusText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 4,
  },
  paymentMethodDetails: {
    marginBottom: 12,
  },
  paymentMethodLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  paymentMethodText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  proofContainer: {
    marginBottom: 12,
  },
  proofLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 6,
  },
  withdrawalDate: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 6,
  },
});

export default WithdrawalHistory;
