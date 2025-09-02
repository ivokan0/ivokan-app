import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from 'react-native-paper';

import ReviewCard from '../../components/ReviewCard';
import { ReviewWithProfiles } from '../../types/database';

type ReviewScreenProps = {
  route: RouteProp<{ ReviewScreen: { tutorId: string; tutorName: string; reviews: ReviewWithProfiles[] } }, 'ReviewScreen'>;
};

const ReviewScreen: React.FC<ReviewScreenProps> = ({ route }) => {
  const { tutorId, tutorName, reviews } = route.params;
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {t('reviews.title')}
        </Text>
        
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tutor Name */}
        <View style={styles.tutorSection}>
          <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
            {tutorName}
          </Text>
          <Text style={[styles.reviewsCount, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutorProfile.reviewsCount', { count: reviews.length })}
          </Text>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tutorSection: {
    padding: 20,
    paddingBottom: 12,
  },
  tutorName: {
    fontSize: 24,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  reviewsCount: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  reviewsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
});

export default ReviewScreen;
