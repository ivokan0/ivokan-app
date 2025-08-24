import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { TutorWithStats } from '../types/database';

interface TutorCardProps {
  tutor: TutorWithStats;
  onPress?: () => void;
}

const getFlagFromCountryCode = (countryCode?: string | null): string => {
  if (!countryCode) return '';
  const upper = countryCode.toUpperCase();
  if (upper.length !== 2) return '';
  try {
    const codePoints = upper.split('').map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
};

const capitalize = (s: string): string => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const TutorCard: React.FC<TutorCardProps> = ({ tutor, onPress }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const firstName = tutor.first_name || '';
  const lastInitial = tutor.last_name ? `${tutor.last_name.charAt(0)}.` : '';
  const countryFlag = getFlagFromCountryCode(tutor.country_birth || undefined);

  const biography = tutor.biography || '';
  const truncatedBio = biography.length > 120 ? `${biography.slice(0, 120)}...` : biography;

  const languages = (tutor.spoken_languages || []).map((lang) => {
    const prof = (tutor.languages_proficiency as any)?.[lang]?.level;
    const langName = capitalize(lang); // Don't use i18n for taught_languages
    const profName = prof ? t(`languages.levels.${prof}`) : '';
    return profName ? `${langName} (${profName})` : langName;
  }).join(', ');

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.surface }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.left}>
        <Image
          source={tutor.avatar_url ? { uri: tutor.avatar_url } : require('../../assets/icon.png')}
          style={styles.avatar}
        />
      </View>

      <View style={styles.right}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {firstName} {lastInitial}
          </Text>
          {!!countryFlag && <Text style={styles.flag}>{countryFlag}</Text>}
          <View style={styles.verified}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        </View>

        {tutor.super_tutor && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '26' }]}> 
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{t('tutor.super_tutor')}</Text>
          </View>
        )}

        <View style={styles.metricsRow}>
          <Text style={[styles.priceLike, { color: theme.colors.onSurface }]}>
            {tutor.tutor_stats?.average_rating?.toFixed?.(1) ?? '0.0'} ★
          </Text>
          <Text style={[styles.muted, { color: theme.colors.onSurfaceVariant }]}>
            {t('tutor.reviews', { count: tutor.tutor_stats?.total_reviews ?? 0 })}
          </Text>
        </View>

        {!!truncatedBio && (
          <Text style={[styles.bio, { color: theme.colors.onSurface }]} numberOfLines={2}>
            {truncatedBio}
          </Text>
        )}

        <Text style={[styles.muted, { color: theme.colors.onSurfaceVariant }]}>
          {t('tutor.stats', { 
            students: tutor.tutor_stats?.total_students ?? 0, 
            lessons: tutor.tutor_stats?.total_lessons ?? 0 
          })}
        </Text>

        {!!languages && (
          <Text style={[styles.muted, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
            {t('tutor.speaks', { languages })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  left: {
    marginRight: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e9e9e9',
  },
  right: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
    marginRight: 6,
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  verified: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLike: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
    marginRight: 12,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 8,
  },
  muted: {
    fontSize: 13,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default TutorCard;



