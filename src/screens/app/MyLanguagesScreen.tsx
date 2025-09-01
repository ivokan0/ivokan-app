import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Divider } from 'react-native-paper';

import { useAuth } from '../../hooks/useAuth';
import { getLanguages } from '../../services/languages';
import { Language, ProficiencyLevel } from '../../types/database';

const MyLanguagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation();
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    const response = await getLanguages();
    if (response.data) {
      setLanguages(response.data);
    }
  };

  const navigateToEditLanguages = (type: 'spoken' | 'taught') => {
    // @ts-ignore
    navigation.navigate('EditMyLanguages', { type });
  };

  const getLanguageName = (languageCode: string) => {
    if (languageCode === 'french' || languageCode === 'english') {
      return t(`settings.language.${languageCode}`);
    }
    const language = languages.find(lang => lang.code === languageCode);
    return language?.name || languageCode;
  };

  const getProficiencyText = (level: ProficiencyLevel) => {
    return t(`languages.levels.${level}`);
  };

  const renderLanguageItem = (languageCode: string, proficiency: ProficiencyLevel) => (
    <View key={languageCode} style={styles.languageItem}>
      <View style={styles.languageInfo}>
        <Text style={[styles.languageName, { color: theme.colors.onSurface }]}>
          {getLanguageName(languageCode)}
        </Text>
        <Text style={[styles.proficiencyText, { color: theme.colors.onSurfaceVariant }]}>
          {getProficiencyText(proficiency)}
        </Text>
      </View>
    </View>
  );

  const renderSection = (
    title: string,
    type: 'spoken' | 'taught',
    languagesList: string[],
    proficiencyData: Record<string, any>
  ) => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigateToEditLanguages(type)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {languagesList.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="translate"
            size={48}
            color={theme.colors.onSurfaceVariant}
            style={{ opacity: 0.5 }}
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {type === 'spoken' ? t('languages.noSpokenLanguages') : t('languages.noTaughtLanguages')}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.primary }]}
            onPress={() => navigateToEditLanguages(type)}
          >
            <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>
              {type === 'spoken' ? t('languages.addFirstSpoken') : t('languages.addFirstTaught')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.languagesList}>
          {languagesList.map(languageCode => {
            const proficiency = proficiencyData[languageCode]?.level || 'beginner';
            return renderLanguageItem(languageCode, proficiency);
          })}
        </View>
      )}
    </View>
  );

  const spokenLanguages = profile?.spoken_languages || [];
  const taughtLanguages = profile?.taught_languages || [];
  const spokenProficiency = profile?.languages_proficiency || {};
  const taughtProficiency = profile?.proficiency_taught_lan || {};

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderSection(
        t('languages.spokenLanguages'),
        'spoken',
        spokenLanguages,
        spokenProficiency
      )}

      {renderSection(
        t('languages.taughtLanguages'),
        'taught',
        taughtLanguages,
        taughtProficiency
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  editButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  languagesList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  proficiencyText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
});

export default MyLanguagesScreen;