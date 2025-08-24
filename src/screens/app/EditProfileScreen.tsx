import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import Avatar from '../../components/ui/Avatar';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar, deleteAvatar } from '../../services/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EditProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, profile } = useAuth();
  const { updateUserProfile } = useProfile();
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [biography, setBiography] = useState(profile?.biography || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    try {
      // Vérifier d'abord les permissions existantes
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      let finalStatus = existingStatus;

      // Si pas de permission, la demander
      if (existingStatus !== 'granted') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
      }

      // Si toujours pas accordée, afficher un message d'erreur
      if (finalStatus !== 'granted') {
        Alert.alert(
          t('profile.permissions.title'),
          t('profile.permissions.gallery'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('profile.permissions.openSettings'), 
              onPress: () => {
                // Optionnel : ouvrir les paramètres de l'app
              }
            }
          ]
        );
        return;
      }

      // Ouvrir la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true);
        
        // Upload de l'image
        const { data: uploadedUrl, error } = await uploadAvatar(
          user!.id,
          result.assets[0].uri,
          true // Compresser l'image
        );

        if (error) {
          Alert.alert(
            t('errors.upload.title'),
            t('errors.upload.message'),
            [{ text: 'OK' }]
          );
        } else if (uploadedUrl) {
          // Supprimer l'ancien avatar si il existe
          if (avatarUrl) {
            await deleteAvatar(avatarUrl);
          }
          setAvatarUrl(uploadedUrl);
        }
      }
    } catch (error) {
      Alert.alert(
        t('errors.unknown'),
        '',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (avatarUrl) {
      setIsUploading(true);
      try {
        await deleteAvatar(avatarUrl);
        setAvatarUrl('');
      } catch (error) {
        // Erreur silencieuse lors de la suppression
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      await updateUserProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        biography: biography.trim() || null,
        avatar_url: avatarUrl || null,
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
        {/* Section Photo de profil */}
        <View style={styles.avatarSection}>
          <Avatar
            size={100}
            firstName={firstName}
            lastName={lastName}
            avatarUrl={avatarUrl}
          />
          
          <View style={styles.avatarButtons}>
            <Button
              mode="outlined"
              onPress={pickImage}
              disabled={isUploading}
              icon="camera"
              style={styles.avatarButton}
            >
              {avatarUrl ? t('profile.changePhoto') : t('profile.addPhoto')}
            </Button>
            
            {avatarUrl && (
              <Button
                mode="text"
                onPress={removeAvatar}
                disabled={isUploading}
                textColor={theme.colors.error}
                icon="delete"
                style={styles.avatarButton}
              >
                {t('profile.removePhoto')}
              </Button>
            )}
          </View>
          
          {isUploading && (
            <Text style={[styles.uploadingText, { color: theme.colors.onSurfaceVariant }]}>
              {t('profile.uploading')}
            </Text>
          )}
        </View>

        {/* Section Informations */}
        <View style={styles.formSection}>
          <AppTextInput
            label={t('auth.signup.firstName')}
            value={firstName}
            onChangeText={setFirstName}
          />
          
          <AppTextInput
            label={t('auth.signup.lastName')}
            value={lastName}
            onChangeText={setLastName}
          />
          
          {/* Biography Section */}
          <View style={styles.biographySection}>
            <Text style={[styles.biographyLabel, { color: theme.colors.onSurface }]}>
              {t('profile.biography')}
            </Text>
            <TextInput
              style={styles.biographyInput}
              value={biography}
              onChangeText={setBiography}
              placeholder={t('profile.biographyPlaceholder')}
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
              numberOfLines={8}
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {biography.length}/1000
            </Text>
          </View>
        </View>

        {/* Bouton Sauvegarder */}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarButtons: {
    marginTop: 16,
    gap: 8,
  },
  avatarButton: {
    minWidth: 150,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  formSection: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
  },
  biographySection: {
    marginTop: 16,
  },
  biographyLabel: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  biographyInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    color: '#000000',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'right',
    marginTop: 4,
    color: '#666666',
  },
});

export default EditProfileScreen;
