import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useCurrency } from '../hooks/useCurrency';
import { EarningWithDetails } from '../types/database';
import Avatar from './ui/Avatar';

type FilterType = 'all' | 'trial' | 'plan';
type FilterStatus = 'all' | 'pending' | 'gained' | 'refunded';

interface TutorEarningsHistoryProps {
  earnings: EarningWithDetails[];
  loading?: boolean;
}

const TutorEarningsHistory: React.FC<TutorEarningsHistoryProps> = ({ earnings, loading = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<FilterType>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const typeFilters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: t('tutor.earningsFilterAll'), icon: 'filter-variant' },
    { key: 'trial', label: t('tutor.earningsFilterTrial'), icon: 'star-outline' },
    { key: 'plan', label: t('tutor.earningsFilterPlan'), icon: 'calendar-check' },
  ];

  const statusFilters: { key: FilterStatus; label: string; icon: string; color: string }[] = [
    { key: 'all', label: t('tutor.earningsFilterAll'), icon: 'filter-variant', color: theme.colors.primary },
    { key: 'pending', label: t('tutor.earningsFilterPending'), icon: 'clock-outline', color: '#FFA726' },
    { key: 'gained', label: t('tutor.earningsFilterGained'), icon: 'check-circle-outline', color: '#66BB6A' },
    { key: 'refunded', label: t('tutor.earningsFilterRefunded'), icon: 'close-circle-outline', color: '#EF5350' },
  ];

  const getFilteredEarnings = () => {
    let filtered = earnings;

    if (selectedTypeFilter !== 'all') {
      filtered = filtered.filter(earning => earning.type === selectedTypeFilter);
    }

    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(earning => earning.status === selectedStatusFilter);
    }

    return filtered;
  };

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
    // For trial bookings, we don't have language info from the database
    // The language_id field exists but it's just text, not a foreign key
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.earningsHistory')}
        </Text>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading history...
          </Text>
        </View>
      </View>
    );
  }

  const filteredEarnings = getFilteredEarnings();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('tutor.earningsHistory')}
        </Text>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons 
            name={showFilters ? "filter-off" : "filter-variant"} 
            size={20} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsFilterAll')}
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
            {typeFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedTypeFilter === filter.key && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedTypeFilter(filter.key)}
              >
                <MaterialCommunityIcons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedTypeFilter === filter.key ? theme.colors.onPrimary : theme.colors.onSurfaceVariant} 
                />
                <Text style={[
                  styles.filterChipText,
                  { color: selectedTypeFilter === filter.key ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsFilterAll')}
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedStatusFilter === filter.key && { backgroundColor: filter.color }
                ]}
                onPress={() => setSelectedStatusFilter(filter.key)}
              >
                <MaterialCommunityIcons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedStatusFilter === filter.key ? 'white' : filter.color} 
                />
                <Text style={[
                  styles.filterChipText,
                  { color: selectedStatusFilter === filter.key ? 'white' : filter.color }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Earnings List */}
      {filteredEarnings.length > 0 ? (
        <View style={styles.earningsList}>
          {filteredEarnings.map((earning) => (
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
      ) : (
        <View style={styles.noEarningsContainer}>
          <MaterialCommunityIcons 
            name="cash-remove" 
            size={48} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={[styles.noEarningsText, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsNoData')}
          </Text>
          <Text style={[styles.noEarningsDescription, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.earningsNoDataDescription')}
          </Text>
        </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  typeFilters: {
    marginBottom: 16,
  },
  statusFilters: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 4,
  },
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    color: '#666',
  },
  noEarningsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEarningsText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginTop: 16,
    textAlign: 'center',
  },
  noEarningsDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default TutorEarningsHistory;
