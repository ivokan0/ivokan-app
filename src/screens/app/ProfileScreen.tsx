import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { profile, isLoading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.email')}:</Text>
            <Text style={styles.value}>{user?.emailAddresses?.[0]?.emailAddress || t('profile.notAvailable')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.firstName')}:</Text>
            <Text style={styles.value}>{profile?.first_name || t('profile.notAvailable')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.lastName')}:</Text>
            <Text style={styles.value}>{profile?.last_name || t('profile.notAvailable')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.timezone')}:</Text>
            <Text style={styles.value}>{profile?.timezone || t('profile.notAvailable')}</Text>
          </View>
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>{t('profile.accountInfo')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.userId')}:</Text>
            <Text style={styles.value}>{user?.id || t('profile.notAvailable')}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t('profile.createdAt')}:</Text>
            <Text style={styles.value}>
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                : t('profile.notAvailable')
              }
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>{t('profile.actions')}</Text>
          
          <Text style={styles.signOutText} onPress={handleSignOut}>
            {t('profile.signOut')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    fontFamily: 'Baloo2_600SemiBold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    fontFamily: 'Baloo2_400Regular',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Baloo2_600SemiBold',
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Baloo2_400Regular',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Baloo2_600SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  signOutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontFamily: 'Baloo2_600SemiBold',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default ProfileScreen;


