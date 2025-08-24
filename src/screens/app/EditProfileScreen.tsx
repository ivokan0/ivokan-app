import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import Avatar from '../../components/ui/Avatar';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import CountryPickerModal from '../../components/ui/CountryPickerModal';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar, deleteAvatar } from '../../services/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Country, getCountryByCode, getLocalizedCountries } from '../../utils/countries';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, profile } = useAuth();
  const { updateUserProfile } = useProfile();
  const navigation = useNavigation();
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [biography, setBiography] = useState(profile?.biography || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  // Get localized countries for initial state
  const localizedCountries = getLocalizedCountries(t);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    profile?.country_birth ? 
      localizedCountries.find(c => c.code === profile.country_birth) || null : 
      null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);



  // Update selected country when language changes
  useEffect(() => {
    if (profile?.country_birth) {
      const updatedLocalizedCountries = getLocalizedCountries(t);
      const updatedCountry = updatedLocalizedCountries.find(c => c.code === profile.country_birth);
      if (updatedCountry) {
        setSelectedCountry(updatedCountry);
      }
    }
  }, [t, profile?.country_birth]);

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
        country_birth: selectedCountry?.code || null,
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
          
          {/* Country of Birth Section - Only for Tutors */}
          {profile?.profile_type === 'tutor' && (
            <View style={styles.countrySection}>
              <Text style={[styles.countryLabel, { color: theme.colors.onSurface }]}>
                {t('profile.countryOfBirth')}
              </Text>
              <TouchableOpacity
                style={[styles.countrySelector, { backgroundColor: '#FFFFFF' }]}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={[
                  styles.countryText,
                  { color: selectedCountry ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
                ]}>
                  {selectedCountry ? selectedCountry.name : t('profile.selectCountry')}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Biography Section - Only for Tutors */}
          {profile?.profile_type === 'tutor' && (
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
          )}

          {/* Presentation Video Section - Only for Tutors */}
          {profile?.profile_type === 'tutor' && (
            <View style={styles.presentationVideoSection}>
              <Text style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
                {t('profile.presentationVideo')}
              </Text>
              <TouchableOpacity
                style={[styles.presentationVideoButton, { backgroundColor: '#FFFFFF' }]}
                onPress={() => navigation.navigate('PresentationVideo' as never)}
              >
                <View style={styles.presentationVideoContent}>
                  <View style={styles.presentationVideoInfo}>
                    <Text style={[
                      styles.presentationVideoText,
                      { color: profile?.presentation_video_url ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
                    ]}>
                      {profile?.presentation_video_url ? t('profile.presentationVideoEdit') : t('profile.presentationVideoAdd')}
                    </Text>
                    {profile?.presentation_video_url && (
                      <Text style={[styles.presentationVideoUrl, { color: theme.colors.onSurfaceVariant }]}>
                        {profile.presentation_video_url}
                      </Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              </TouchableOpacity>
              

            </View>
          )}
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

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelectCountry={setSelectedCountry}
        selectedCountry={selectedCountry}
      />
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
  countrySection: {
    marginTop: 16,
  },
  countryLabel: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  countryText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    flex: 1,
  },
  presentationVideoSection: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
  },
  presentationVideoButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presentationVideoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  presentationVideoInfo: {
    flex: 1,
  },
  presentationVideoText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  presentationVideoUrl: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 4,
  },

});

export default EditProfileScreen;
