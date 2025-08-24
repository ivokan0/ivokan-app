import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getLanguages } from '../../services/languages';
import { updateProfile } from '../../services/profiles';
import { Language, ProficiencyLevel, SPOKEN_LANGUAGES } from '../../types/database';
import AppButton from '../../components/ui/AppButton';

interface RouteParams {
  type: 'spoken' | 'taught';
}

interface LanguageEntry {
  code: string;
  name: string;
  proficiency: ProficiencyLevel;
}

const EditMyLanguagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { profile, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params as RouteParams;

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageEntry[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);

  useEffect(() => {
    loadLanguages();
    loadCurrentLanguages();
  }, [type]);

  const loadLanguages = async () => {
    const response = await getLanguages();
    if (response.data) {
      setLanguages(response.data);
      updateAvailableLanguages(response.data);
    }
  };

  const loadCurrentLanguages = () => {
    if (!profile) return;

    const currentLanguages = type === 'spoken' ? profile.spoken_languages : profile.taught_languages;
    const currentProficiency = type === 'spoken' ? profile.languages_proficiency : profile.proficiency_taught_lan;

    const languageEntries: LanguageEntry[] = currentLanguages.map(code => ({
      code,
      name: getLanguageName(code),
      proficiency: (currentProficiency[code]?.level || 'beginner') as ProficiencyLevel
    }));

    setSelectedLanguages(languageEntries);
  };

  const updateAvailableLanguages = (allLanguages: Language[]) => {
    if (type === 'spoken') {
      // Pour les langues parlées, montrer uniquement français/anglais
      const spokenOptions = SPOKEN_LANGUAGES.map(code => ({
        id: code,
        code,
        name: t(`settings.language.${code}`),
        created_at: ''
      }));
      
      setAvailableLanguages(spokenOptions);
    } else {
      // Pour les langues enseignées, montrer toutes les langues disponibles
      setAvailableLanguages(allLanguages);
    }
  };

  const getLanguageName = (languageCode: string) => {
    if (languageCode === 'french' || languageCode === 'english') {
      return t(`settings.language.${languageCode}`);
    }
    const language = languages.find(lang => lang.code === languageCode);
    return language?.name || languageCode;
  };

  const getUnselectedLanguages = () => {
    return availableLanguages.filter(
      lang => !selectedLanguages.some(selected => selected.code === lang.code)
    );
  };

  const toggleAddLanguage = () => {
    const unselectedLanguages = getUnselectedLanguages();

    if (unselectedLanguages.length === 0) {
      Alert.alert(
        t('languages.addLanguage'),
        'Toutes les langues disponibles ont été ajoutées.'
      );
      return;
    }

    setShowAddLanguage(!showAddLanguage);
  };

  const selectLanguage = (language: Language) => {
    const newLanguage: LanguageEntry = {
      code: language.code,
      name: language.name,
      proficiency: 'beginner'
    };

    setSelectedLanguages([...selectedLanguages, newLanguage]);
    setShowAddLanguage(false);
  };

  const removeLanguage = (code: string) => {
    Alert.alert(
      t('languages.deleteConfirmation'),
      t('languages.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('languages.delete'),
          style: 'destructive',
          onPress: () => {
            setSelectedLanguages(selectedLanguages.filter(lang => lang.code !== code));
          }
        }
      ]
    );
  };

  const updateProficiency = (code: string, proficiency: ProficiencyLevel) => {
    setSelectedLanguages(selectedLanguages.map(lang => 
      lang.code === code ? { ...lang, proficiency } : lang
    ));
  };

  const saveLanguages = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const languageCodes = selectedLanguages.map(lang => lang.code);
      const proficiencyData = selectedLanguages.reduce((acc, lang) => {
        acc[lang.code] = { level: lang.proficiency };
        return acc;
      }, {} as Record<string, any>);

      const updateData = type === 'spoken' 
        ? {
            spoken_languages: languageCodes,
            languages_proficiency: proficiencyData
          }
        : {
            taught_languages: languageCodes,
            proficiency_taught_lan: proficiencyData
          };

      const response = await updateProfile(profile.user_id, updateData);
      
      if (response.error) {
        Alert.alert(
          t('errors.save.title'),
          t('errors.save.message')
        );
      } else {
        await refreshProfile();
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(
        t('errors.save.title'),
        t('errors.save.message')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const proficiencyLevels: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'native'];

  const renderLanguageCard = (language: LanguageEntry) => (
    <View key={language.code} style={[styles.languageCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.languageHeader}>
        <Text style={[styles.languageName, { color: theme.colors.onSurface }]}>
          {language.name}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeLanguage(language.code)}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={theme.colors.error}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.proficiencyLabel, { color: theme.colors.onSurfaceVariant }]}>
        {t('languages.proficiency')}
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proficiencyContainer}>
        {proficiencyLevels.map(level => (
          <TouchableOpacity
            key={level}
            style={[
              styles.proficiencyButton,
              {
                backgroundColor: language.proficiency === level 
                  ? theme.colors.primary 
                  : theme.colors.surface,
                borderColor: theme.colors.outline
              }
            ]}
            onPress={() => updateProficiency(language.code, level)}
          >
            <Text
              style={[
                styles.proficiencyButtonText,
                {
                  color: language.proficiency === level 
                    ? theme.colors.onPrimary 
                    : theme.colors.onSurface
                }
              ]}
            >
              {t(`languages.levels.${level}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAvailableLanguageCard = (language: Language) => (
    <TouchableOpacity
      key={language.code}
      style={[styles.availableLanguageCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}
      onPress={() => selectLanguage(language)}
    >
      <Text style={[styles.availableLanguageName, { color: theme.colors.onSurface }]}>
        {language.name}
      </Text>
      <MaterialCommunityIcons
        name="plus"
        size={20}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {type === 'spoken' ? t('languages.spokenLanguages') : t('languages.taughtLanguages')}
        </Text>

        {/* Langues sélectionnées */}
        {selectedLanguages.length === 0 ? (
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
          </View>
        ) : (
          <View style={styles.languagesList}>
            {selectedLanguages.map(renderLanguageCard)}
          </View>
        )}

        {/* Bouton pour ajouter une langue */}
        <TouchableOpacity
          style={[styles.addLanguageButton, { borderColor: theme.colors.primary }]}
          onPress={toggleAddLanguage}
        >
          <MaterialCommunityIcons
            name={showAddLanguage ? "minus" : "plus"}
            size={24}
            color={theme.colors.primary}
          />
          <Text style={[styles.addLanguageText, { color: theme.colors.primary }]}>
            {showAddLanguage ? 'Fermer' : t('languages.addLanguage')}
          </Text>
        </TouchableOpacity>

        {/* Cards des langues disponibles */}
        {showAddLanguage && (
          <View style={styles.availableLanguagesSection}>
            <Text style={[styles.availableTitle, { color: theme.colors.onSurface }]}>
              Langues disponibles
            </Text>
            <View style={styles.availableLanguagesList}>
              {getUnselectedLanguages().map(renderAvailableLanguageCard)}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={t('languages.save')}
          onPress={saveLanguages}
          loading={isLoading}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
    marginTop: 16,
  },
  languagesList: {
    gap: 16,
    marginBottom: 24,
  },
  languageCard: {
    padding: 16,
    borderRadius: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  removeButton: {
    padding: 4,
  },
  proficiencyLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  proficiencyContainer: {
    flexDirection: 'row',
  },
  proficiencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  proficiencyButtonText: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  addLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginTop: 16,
  },
  addLanguageText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
    marginLeft: 8,
  },
  availableLanguagesSection: {
    marginTop: 24,
  },
  availableTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 16,
  },
  availableLanguagesList: {
    gap: 12,
  },
  availableLanguageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  availableLanguageName: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default EditMyLanguagesScreen;