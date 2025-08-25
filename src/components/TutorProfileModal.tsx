import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConversationWithProfiles } from '../types/database';

interface TutorProfileModalProps {
  visible: boolean;
  onClose: () => void;
  conversation: ConversationWithProfiles;
  currentUserId: string;
  onBookTrial?: () => void;
  onOpenProfile?: () => void;
}

const TutorProfileModal: React.FC<TutorProfileModalProps> = ({
  visible,
  onClose,
  conversation,
  currentUserId,
  onBookTrial,
  onOpenProfile,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const tutor = conversation.tutor_id === currentUserId ? conversation.student : conversation.tutor;

  const shareProfile = async () => {
    try {
      const profileUrl = tutor.profile_link 
        ? `https://ivokan.com/tutor/${tutor.profile_link}`
        : `https://ivokan.com/tutor/${tutor.user_id}`;
      
      await Share.share({
        message: t('tutorProfile.shareMessage', { 
          name: `${tutor.first_name} ${tutor.last_name}`,
          url: profileUrl 
        }),
        url: profileUrl,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('tutorProfile.shareError'));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('tutorProfile.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tutor Info */}
          <View style={styles.tutorInfo}>
            {tutor.avatar_url ? (
              <Image source={{ uri: tutor.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>
                  {tutor.first_name?.[0]?.toUpperCase() || tutor.last_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            
                         <Text style={[styles.tutorName, { color: theme.colors.onSurface }]}>
               {tutor.first_name} {tutor.last_name}
             </Text>
          </View>

                     {/* Actions */}
           <View style={styles.actions}>
           <TouchableOpacity
               style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}
               onPress={onOpenProfile}
             >
               <MaterialCommunityIcons
                 name="account"
                 size={20}
                 color={theme.colors.onSurface}
               />
               <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
                 {t('tutorProfile.openProfile')}
               </Text>
             </TouchableOpacity>


             <TouchableOpacity
               style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}
               onPress={shareProfile}
             >
               <MaterialCommunityIcons
                 name="share-variant"
                 size={20}
                 color={theme.colors.onSurface}
               />
               <Text style={[styles.actionButtonText, { color: theme.colors.onSurface }]}>
                 {t('tutorProfile.shareProfile')}
               </Text>
             </TouchableOpacity>



             <TouchableOpacity
               style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
               onPress={onBookTrial}
             >
               <MaterialCommunityIcons
                 name="calendar-plus"
                 size={20}
                 color={theme.colors.onPrimary}
               />
               <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                 {t('tutorProfile.bookTrialLesson')}
               </Text>
             </TouchableOpacity>
           </View>
        </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tutorInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Baloo2_600SemiBold',
  },
  tutorName: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  tutorType: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  biography: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
  },
});

export default TutorProfileModal;
