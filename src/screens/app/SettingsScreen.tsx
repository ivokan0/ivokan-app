import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../translations/i18n';
import { useTheme, Divider } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [lng, setLng] = useState<'en' | 'fr'>(i18n.language.startsWith('fr') ? 'fr' : 'en');
  const theme = useTheme();

  const onChange = useCallback(async (value: 'en' | 'fr') => {
    setLng(value);
    await setLanguage(value);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{t('settings.title')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{t('settings.soon')}</Text>
      <View style={{ height: 24 }} />
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('settings.language.label')}</Text>
      <View style={styles.languageOptions}>
        <TouchableOpacity
          style={[
            styles.languageOption,
            { 
              backgroundColor: lng === 'en' ? theme.colors.primaryContainer : theme.colors.surface
            }
          ]}
          onPress={() => onChange('en')}
        >
          <Text style={[
            styles.languageText,
            { color: lng === 'en' ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
          ]}>
            {t('settings.language.english')}
          </Text>
        </TouchableOpacity>
        
        <Divider style={styles.divider} />
        
        <TouchableOpacity
          style={[
            styles.languageOption,
            { 
              backgroundColor: lng === 'fr' ? theme.colors.primaryContainer : theme.colors.surface
            }
          ]}
          onPress={() => onChange('fr')}
        >
          <Text style={[
            styles.languageText,
            { color: lng === 'fr' ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
          ]}>
            {t('settings.language.french')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 8, 
    fontFamily: 'Baloo2_600SemiBold' 
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 16
  },
  label: { 
    marginBottom: 8,
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular'
  },
  languageOptions: {
    borderRadius: 8,
    overflow: 'hidden'
  },
  languageOption: {
    padding: 16,
    alignItems: 'center'
  },
  languageText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular'
  },
  divider: {
    marginHorizontal: 16,
  }
});

export default SettingsScreen;


