import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SuperTutorInfoScreen: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.closeButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.mainTitle, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            {t('superTutorInfo.subtitle')}
          </Text>
          <Text style={[styles.updateInfo, { color: theme.colors.onSurfaceVariant }]}>
            {t('superTutorInfo.updated')}
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.introduction')}
          </Text>
        </View>

        {/* Badge Visual */}
        <View style={styles.badgeSection}>
          <View style={styles.badgeContainer}>
            <View style={[styles.badgeIcon, { backgroundColor: '#FF6B9D' }]}>
              <MaterialCommunityIcons name="star" size={20} color="#fff" />
            </View>
            <View style={styles.badgeTextContainer}>
              <Text style={[styles.badgeTitle, { color: theme.colors.onSurface }]}>
                {t('superTutorInfo.badgeTitle')}
              </Text>
              <Text style={[styles.badgeDescription, { color: theme.colors.onSurface }]}>
                {t('superTutorInfo.badgeDescription')}
              </Text>
            </View>
          </View>
        </View>

        {/* What is a Super Tutor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.whatIsTitle')}
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.whatIsDescription')}
          </Text>
        </View>

        {/* How do tutors get the badge */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.howToGetTitle')}
          </Text>
          <View style={styles.criteriaList}>
            {[
              'criterion1',
              'criterion2', 
              'criterion3',
              'criterion4',
              'criterion5',
              'criterion6'
            ].map((criterion, index) => (
              <View key={index} style={styles.criterionItem}>
                <Text style={[styles.bulletPoint, { color: theme.colors.primary }]}>•</Text>
                <Text style={[styles.criterionText, { color: theme.colors.onSurface }]}>
                  {t(`superTutorInfo.${criterion}`)}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
            {t('superTutorInfo.criteriaNote')}
          </Text>
        </View>

        {/* Should I only choose a Super Tutor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.shouldChooseTitle')}
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.shouldChooseParagraph1')}
          </Text>
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            {t('superTutorInfo.shouldChooseParagraph2')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 4,
  },
  updateInfo: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
  },
  badgeSection: {
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  criteriaList: {
    marginBottom: 12,
  },
  criterionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 2,
  },
  criterionText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
    flex: 1,
  },
  note: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
  },
});

export default SuperTutorInfoScreen;
