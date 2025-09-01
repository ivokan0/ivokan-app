import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';

import AppButton from '../../components/ui/AppButton';
import AppTextInput from '../../components/ui/AppTextInput';
import YouTubePlayer from '../../components/ui/YouTubePlayer';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

const PresentationVideoScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const { updateUserProfile } = useProfile();
  
  const [videoUrl, setVideoUrl] = useState(profile?.presentation_video_url || '');
  const [isLoading, setIsLoading] = useState(false);

  const isValidYouTubeUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}(.*)?$/;
    return youtubeRegex.test(url.trim());
  };

  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleSave = async () => {
    const trimmedUrl = videoUrl.trim();
    
    if (trimmedUrl && !isValidYouTubeUrl(trimmedUrl)) {
      Alert.alert(
        t('errors.invalidUrl.title'),
        t('errors.invalidUrl.youtube'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      await updateUserProfile({
        presentation_video_url: trimmedUrl || null,
      });
      Alert.alert(
        t('profile.saveSuccess.title'),
        t('profile.saveSuccess.message'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t('errors.save.title'),
        t('errors.save.message'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {t('profile.presentationVideo')}
          </Text>
          
          <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {t('profile.presentationVideoDescription')}
          </Text>

          <View style={styles.formSection}>
            <AppTextInput
              label={t('profile.presentationVideoPlaceholder')}
              value={videoUrl}
              onChangeText={setVideoUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
            
            {videoUrl && !isValidYouTubeUrl(videoUrl) && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {t('errors.invalidUrl.youtube')}
              </Text>
            )}
          </View>

          {/* Video Preview Section */}
          {videoUrl && isValidYouTubeUrl(videoUrl) && getVideoId(videoUrl) && (
            <View style={styles.videoSection}>
              <Text style={[styles.videoLabel, { color: theme.colors.onSurface }]}>
                {t('profile.presentationVideoPreview')}
              </Text>
              <YouTubePlayer videoUrl={videoUrl} height={220} />
            </View>
          )}

          <AppButton
            label={t('profile.save')}
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 24,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 8,
    marginLeft: 4,
  },
  videoSection: {
    marginBottom: 32,
  },
  videoLabel: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default PresentationVideoScreen;

