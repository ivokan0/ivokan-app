import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { getReviewsWithProfiles } from '../services/reviews';
import { ReviewWithProfiles } from '../types/database';
import ReviewCard from './ReviewCard';

const TutorReviewsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: reviewsError } = await getReviewsWithProfiles(user.id);
        
        if (reviewsError) {
          console.error('Error loading reviews:', reviewsError);
          setError('Failed to load reviews');
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user?.id]);

  const handleViewAllReviews = () => {
    if (user?.id) {
      const displayName = user.user_metadata?.full_name || user.email || 'Tutor';
      (navigation as any).navigate('ReviewScreen', {
        tutorId: user.id,
        tutorName: displayName,
        reviews: reviews
      });
    }
  };

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

  if (reviews.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="star-outline"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            {t('tutor.reviews.noReviews')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.reviews.noReviewsDescription')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.reviewsContainer}
        showsVerticalScrollIndicator={false}
      >
        {reviews.slice(0, 3).map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <ReviewCard review={review} />
          </View>
        ))}
      </ScrollView>

      {reviews.length > 3 && (
        <TouchableOpacity
          style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleViewAllReviews}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.onPrimary }]}>
            {t('tutor.reviews.viewAll', { count: reviews.length })}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.onPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reviewsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reviewCard: {
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewAllText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginRight: 8,
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
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TutorReviewsSection;
