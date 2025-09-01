import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReviewWithProfiles } from '../types/database';

interface ReviewCardProps {
  review: ReviewWithProfiles;
  onReply?: (review: ReviewWithProfiles) => void;
  showReplyButton?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReply, showReplyButton = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return t('reviews.today');
    } else if (diffDays < 7) {
      return t('reviews.daysAgo', { days: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('reviews.weeksAgo', { weeks });
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return t('reviews.monthsAgo', { months });
    } else {
      const years = Math.floor(diffDays / 365);
      return t('reviews.yearsAgo', { years });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFD700' : '#E0E0E0'}
        />
      );
    }
    return stars;
  };

  const studentFirstName = review.student.first_name || '';
  const studentLastInitial = review.student.last_name ? `${review.student.last_name.charAt(0)}.` : '';
  const studentDisplayName = `${studentFirstName} ${studentLastInitial}`.trim();
  
  // Get the first letter of the student's name for avatar fallback
  const getStudentInitial = () => {
    if (studentFirstName) return studentFirstName.charAt(0).toUpperCase();
    if (review.student.last_name) return review.student.last_name.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header with student info and rating */}
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          {review.student.avatar_url ? (
            <Image
              source={{ uri: review.student.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                {getStudentInitial()}
              </Text>
            </View>
          )}
          <View style={styles.studentDetails}>
            <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
              {studentDisplayName}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(review.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(review.rating)}
        </View>
      </View>

      {/* Review comment */}
      {review.comment && (
        <Text style={[styles.comment, { color: theme.colors.onSurface }]}>
          {review.comment}
        </Text>
      )}

      {/* Tutor reply */}
      {review.reply && (
        <View style={[styles.replyContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.replyHeader}>
            <MaterialCommunityIcons
              name="reply"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.replyLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('reviews.tutorReply')}
            </Text>
          </View>
          <Text style={[styles.replyText, { color: theme.colors.onSurface }]}>
            {review.reply}
          </Text>
        </View>
      )}

      {/* Reply Button */}
      {showReplyButton && !review.reply && onReply && (
        <TouchableOpacity
          style={[styles.replyButton, { borderColor: theme.colors.primary }]}
          onPress={() => onReply(review)}
        >
          <MaterialCommunityIcons
            name="reply"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.replyButtonText, { color: theme.colors.primary }]}>
            {t('tutor.reviews.reply')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9e9e9',
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comment: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  replyContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 6,
  },
  replyText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    marginLeft: 6,
  },
});

export default ReviewCard;
