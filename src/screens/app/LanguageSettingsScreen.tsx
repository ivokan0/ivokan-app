import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, RadioButton, Divider } from 'react-native-paper';

const LanguageSettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const languages = [
    { code: 'fr', name: t('settings.language.french'), flag: '🇫🇷' },
    { code: 'en', name: t('settings.language.english'), flag: '🇺🇸' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      // Erreur silencieuse lors du changement de langue
    }
  };

  const LanguageOption = ({ language, isLast }: { language: typeof languages[0]; isLast: boolean }) => (
    <>
      <TouchableOpacity
        style={styles.languageOption}
        onPress={() => handleLanguageChange(language.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{language.flag}</Text>
          <Text style={[styles.languageName, { color: theme.colors.onSurface }]}>
            {language.name}
          </Text>
        </View>
        <RadioButton
          value={language.code}
          status={selectedLanguage === language.code ? 'checked' : 'unchecked'}
          onPress={() => handleLanguageChange(language.code)}
        />
      </TouchableOpacity>
      {!isLast && <Divider style={styles.divider} />}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {t('settings.language.selectLanguage')}
        </Text>
        
        <View style={styles.languageList}>
          {languages.map((language, index) => (
            <LanguageOption 
              key={language.code} 
              language={language} 
              isLast={index === languages.length - 1}
            />
          ))}
        </View>
      </View>
    </View>
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 24,
  },
  languageList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  divider: {
    marginHorizontal: 16,
  },
});

export default LanguageSettingsScreen;
