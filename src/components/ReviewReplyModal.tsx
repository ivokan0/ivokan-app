import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { updateReview } from '../services/reviews';
import { ReviewWithProfiles } from '../types/database';

interface ReviewReplyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review: ReviewWithProfiles;
}

const ReviewReplyModal: React.FC<ReviewReplyModalProps> = ({
  visible,
  onClose,
  onSuccess,
  review,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reply, setReply] = useState(review.reply || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitReply = async () => {
    if (!reply.trim()) {
      Alert.alert(t('errors.validation.title'), t('errors.validation.replyRequired'));
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await updateReview(review.id, { reply: reply.trim() });
      
      if (error) {
        console.error('Error updating review:', error);
        Alert.alert(t('common.error'), t('errors.review.replyFailed'));
      } else {
        Alert.alert(
          t('common.success'),
          t('tutor.reviews.replySubmitted'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                onSuccess();
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error updating review:', error);
      Alert.alert(t('common.error'), t('errors.review.replyFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReply(review.reply || '');
    onClose();
  };

  const studentName = review.student?.first_name 
    ? `${review.student.first_name} ${review.student.last_name?.charAt(0) || ''}`.trim()
    : t('common.unknown');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('tutor.reviews.replyToReview')}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        {/* Review Content */}
        <View style={styles.reviewSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('tutor.reviews.studentReview')}
          </Text>
          
          <View style={[styles.reviewCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.reviewHeader}>
              <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
                {studentName}
              </Text>
            </View>
            
            {review.comment && (
              <Text style={[styles.reviewComment, { color: theme.colors.onSurface }]}>
                "{review.comment}"
              </Text>
            )}
          </View>
        </View>

        {/* Reply Input */}
        <View style={styles.replySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('tutor.reviews.yourReply')}
          </Text>
          
          <TextInput
            mode="outlined"
            value={reply}
            onChangeText={setReply}
            placeholder={t('tutor.reviews.replyPlaceholder')}
            multiline
            numberOfLines={4}
            style={styles.replyInput}
            maxLength={500}
          />
          
          <Text style={[styles.characterCount, { color: theme.colors.onSurfaceVariant }]}>
            {reply.length}/500
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmitReply}
            loading={isLoading}
            disabled={!reply.trim() || isLoading}
            style={styles.submitButton}
          >
            {t('tutor.reviews.submitReply')}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  reviewSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 8,
  },
  reviewHeader: {
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  replySection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  replyInput: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default ReviewReplyModal;
