import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../translations/i18n';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from 'react-native-paper';

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [lng, setLng] = useState<'en' | 'fr'>(i18n.language.startsWith('fr') ? 'fr' : 'en');
  const theme = useTheme();

  const onChange = useCallback(async (value: 'en' | 'fr') => {
    setLng(value);
    await setLanguage(value);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <Text>{t('settings.soon')}</Text>
      <View style={{ height: 24 }} />
      <Text style={{ marginBottom: 8 }}>{t('settings.language.label')}</Text>
      <View style={[styles.pickerWrapper, { borderColor: theme.colors.outline }]}>
        <Picker selectedValue={lng} onValueChange={(v) => onChange(v)}>
          <Picker.Item label={t('settings.language.english')} value="en" />
          <Picker.Item label={t('settings.language.french')} value="fr" />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, fontFamily: 'Baloo2_600SemiBold' },
  pickerWrapper: { width: '80%', borderWidth: 1, borderRadius: 8 },
});

export default SettingsScreen;


