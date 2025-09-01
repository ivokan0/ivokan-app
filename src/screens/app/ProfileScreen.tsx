import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Divider } from 'react-native-paper';

import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigation = useNavigation();

  const navigateToEditProfile = () => {
    // @ts-ignore
    navigation.navigate('EditProfile');
  };

  const navigateToLanguageSettings = () => {
    // @ts-ignore
    navigation.navigate('LanguageSettings');
  };

  const navigateToTimezoneSettings = () => {
    // @ts-ignore
    navigation.navigate('TimezoneSettings');
  };

  const navigateToCurrencySettings = () => {
    // @ts-ignore
    navigation.navigate('CurrencySettings');
  };

  const navigateToAvailabilitySettings = () => {
    // @ts-ignore
    navigation.navigate('AvailabilitySettings');
  };

  const navigateToPaymentMethods = () => {
    // @ts-ignore
    navigation.navigate('PaymentMethods');
  };

  const navigateToMyLanguages = () => {
    // @ts-ignore
    navigation.navigate('MyLanguages');
  };

  const navigateToMyResume = () => {
    // @ts-ignore
    navigation.navigate('MyResume');
  };

  const navigateToPresentationVideo = () => {
    // @ts-ignore
    navigation.navigate('PresentationVideo');
  };



  const openFAQ = () => {
    // @ts-ignore
    navigation.navigate('WebView', {
      url: 'https://www.ivokan.com/faq',
      title: t('assistance.faq')
    });
  };

  const openLegalCenter = () => {
    // @ts-ignore
    navigation.navigate('WebView', {
      url: 'https://www.ivokan.com/usage',
      title: t('assistance.legalCenter')
    });
  };



  const MenuRow = ({ icon, title, onPress, showArrow = true }: {
    icon: string;
    title: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuRowContent}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={theme.colors.onSurface}
          style={[styles.menuIcon, { opacity: 0.5 }]}
        />
        <Text style={[styles.menuTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
      {showArrow && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
          style={{ opacity: 0.7 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Section Informations utilisateur */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.userSection}>
          <Avatar
            size={80}
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            avatarUrl={profile?.avatar_url}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
              {profile?.first_name && profile?.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : user?.email || t('profile.notAvailable')}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.onSurfaceVariant }]}>
              {user?.emailAddresses?.[0]?.emailAddress || user?.email || t('profile.notAvailable')}
            </Text>
          </View>
        </View>

        <MenuRow
          icon="account-edit"
          title={t('profile.editProfile')}
          onPress={navigateToEditProfile}
        />
        
        <Divider style={styles.divider} />
      </View>

      {/* Section Paramètres */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('settings.title')}
        </Text>

        <MenuRow
          icon="translate"
          title={t('settings.language.label')}
          onPress={navigateToLanguageSettings}
        />

        <MenuRow
          icon="clock-outline"
          title={t('profile.timezone')}
          onPress={navigateToTimezoneSettings}
        />

        <MenuRow
          icon="currency-eur"
          title={t('settings.currency.label')}
          onPress={navigateToCurrencySettings}
        />

        {profile?.profile_type === 'tutor' && (
          <MenuRow
            icon="calendar-clock"
            title={t('settings.availability.title')}
            onPress={navigateToAvailabilitySettings}
          />
        )}

        {profile?.profile_type === 'tutor' && (
          <MenuRow
            icon="credit-card-multiple"
            title={t('settings.paymentMethods.title')}
            onPress={navigateToPaymentMethods}
          />
        )}

        {profile?.profile_type === 'tutor' && (
          <MenuRow
            icon="translate"
            title={t('languages.myLanguages')}
            onPress={navigateToMyLanguages}
          />
        )}

        {profile?.profile_type === 'tutor' && (
          <MenuRow
            icon="file-document-outline"
            title={t('resume.title')}
            onPress={navigateToMyResume}
          />
        )}
        
        <Divider style={styles.divider} />
      </View>

      {/* Section Assistance */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('assistance.title')}
        </Text>

        <MenuRow
          icon="help-circle-outline"
          title={t('assistance.faq')}
          onPress={openFAQ}
        />

        <MenuRow
          icon="file-document-outline"
          title={t('assistance.legalCenter')}
          onPress={openLegalCenter}
        />
        
        <Divider style={styles.divider} />
      </View>

      {/* Bouton Se déconnecter */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
        >
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color={theme.colors.error}
            style={styles.signOutIcon}
          />
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>
            {t('profile.signOut')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  divider: {
    marginVertical: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutIcon: {
    marginRight: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default ProfileScreen;
