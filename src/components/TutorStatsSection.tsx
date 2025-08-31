import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { getTutorStats } from '../services/tutorStats';
import { getTutorWithStats } from '../services/tutors';
import { TutorStats } from '../types/database';
import StatsCard from './ui/StatsCard';
import TutorReviewsSection from './TutorReviewsSection';

const TutorStatsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleViewProfile = async () => {
    if (user?.id) {
      try {
        // Get the current tutor's profile with stats
        const { data: tutorWithStats, error } = await getTutorWithStats(user.id);
        
        if (error || !tutorWithStats) {
          console.error('Error loading tutor profile:', error);
          return;
        }

        // Navigate to the tutor own profile screen
        (navigation as any).navigate('TutorOwnProfile', {
          tutor: tutorWithStats
        });
      } catch (error) {
        console.error('Error navigating to profile:', error);
      }
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: statsError } = await getTutorStats(user.id);
        
        if (statsError) {
          console.error('Error loading tutor stats:', statsError);
          // If no stats found, create default stats
          if (statsError.code === 'PGRST116') {
            setStats({
              tutor_id: user.id,
              total_reviews: 0,
              average_rating: 0,
              total_students: 0,
              total_lessons: 0,
              id: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return;
          }
          setError('Failed to load stats');
          return;
        }

        setStats(data);
      } catch (err) {
        console.error('Error loading tutor stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.noStatsAvailable')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Button */}
      <TouchableOpacity
        style={[styles.profileButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleViewProfile}
      >
        <MaterialCommunityIcons
          name="account-circle"
          size={24}
          color={theme.colors.onPrimary}
        />
        <Text style={[styles.profileButtonText, { color: theme.colors.onPrimary }]}>
          {t('tutor.seeMyProfile')}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onPrimary}
        />
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          {t('tutor.stats.title')}
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('tutor.stats.subtitle')}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatsCard
            title={t('tutor.stats.totalReviews')}
            value={stats.total_reviews}
            icon="star"
            color="#FFD700"
          />
          <StatsCard
            title={t('tutor.stats.averageRating')}
            value={stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '0.0'}
            icon="star-outline"
            color="#FF6B6B"
          />
        </View>
        <View style={styles.statsRow}>
          <StatsCard
            title={t('tutor.stats.totalStudents')}
            value={stats.total_students}
            icon="account-group"
            color="#4ECDC4"
          />
          <StatsCard
            title={t('tutor.stats.totalLessons')}
            value={stats.total_lessons}
            icon="book-open-variant"
            color="#45B7D1"
          />
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('tutor.reviews.title')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.reviews.subtitle')}
          </Text>
        </View>
        <TutorReviewsSection />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    fontWeight: '400',
  },
  statsGrid: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  reviewsSection: {
    marginTop: 24,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileButtonText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default TutorStatsSection;
