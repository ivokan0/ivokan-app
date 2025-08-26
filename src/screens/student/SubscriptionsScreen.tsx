import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getStudentSubscriptionsWithDetails } from '../../services/studentSubscriptions';
import { StudentSubscriptionWithDetails } from '../../types/database';
import StudentSubscriptionCard from '../../components/StudentSubscriptionCard';

type TabType = 'active' | 'expired';

const SubscriptionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [subscriptions, setSubscriptions] = useState<StudentSubscriptionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = async (showLoader = true) => {
    if (!profile?.user_id) return;

    try {
      if (showLoader) setIsLoading(true);
      
      const { data, error } = await getStudentSubscriptionsWithDetails({
        student_id: profile.user_id,
      });
      
      if (error) {
        console.error('Error loading subscriptions:', error);
        Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
    } finally {
      if (showLoader) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscriptions(false);
  }, [profile?.user_id]);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptions();
    }, [profile?.user_id])
  );

  const getFilteredSubscriptions = () => {
    const now = new Date();
    
    return subscriptions.filter(subscription => {
      const endDate = new Date(subscription.end_date);
      const isExpired = endDate < now || subscription.status === 'expired';
      
      return activeTab === 'active' ? !isExpired : isExpired;
    });
  };

  const renderTabButton = (tab: TabType, label: string, count: number) => {
    const isActive = activeTab === tab;
    
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? theme.colors.primary : 'transparent',
            borderColor: theme.colors.primary,
          }
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[
          styles.tabButtonText,
          {
            color: isActive ? theme.colors.onPrimary : theme.colors.primary,
            fontFamily: 'Baloo2_600SemiBold',
          }
        ]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[
            styles.tabBadge,
            {
              backgroundColor: isActive ? theme.colors.onPrimary : theme.colors.primary,
            }
          ]}>
            <Text style={[
              styles.tabBadgeText,
              {
                color: isActive ? theme.colors.primary : theme.colors.onPrimary,
                fontFamily: 'Baloo2_600SemiBold',
              }
            ]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isActiveTab = activeTab === 'active';
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name={isActiveTab ? "credit-card-plus" : "calendar-remove"}
          size={64}
          color={theme.colors.onSurfaceVariant}
        />
        <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
          {isActiveTab 
            ? t('subscription.empty.activeTitle')
            : t('subscription.empty.expiredTitle')
          }
        </Text>
        <Text style={[styles.emptyDescription, { color: theme.colors.onSurfaceVariant }]}>
          {isActiveTab 
            ? t('subscription.empty.activeDescription')
            : t('subscription.empty.expiredDescription')
          }
        </Text>
      </View>
    );
  };

  const renderSubscriptionCard = ({ item }: { item: StudentSubscriptionWithDetails }) => (
    <StudentSubscriptionCard subscription={item} />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          {t('common.loading')}...
        </Text>
      </View>
    );
  }

  const filteredSubscriptions = getFilteredSubscriptions();
  const activeCount = subscriptions.filter(sub => {
    const endDate = new Date(sub.end_date);
    const now = new Date();
    return endDate >= now && sub.status === 'active';
  }).length;
  
  const expiredCount = subscriptions.filter(sub => {
    const endDate = new Date(sub.end_date);
    const now = new Date();
    return endDate < now || sub.status === 'expired';
  }).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('active', t('subscription.tabs.active'), activeCount)}
        {renderTabButton('expired', t('subscription.tabs.expired'), expiredCount)}
      </View>

      {/* Content */}
      {filteredSubscriptions.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredSubscriptions}
          renderItem={renderSubscriptionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default SubscriptionsScreen;
