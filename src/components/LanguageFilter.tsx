import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { useTheme } from 'react-native-paper';

interface LanguageFilterProps {
  availableLanguages: string[];
  selectedLanguage: string | null;
  onLanguageSelect: (language: string | null) => void;
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({
  availableLanguages,
  selectedLanguage,
  onLanguageSelect,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const getLanguageName = (languageCode: string) => {
    // Don't use i18n for taught_languages, just capitalize them
    return languageCode.charAt(0).toUpperCase() + languageCode.slice(1);
  };

  const getLanguageFlag = (languageCode: string) => {
    // Map language codes to country codes for flags
    const languageToCountry: Record<string, string> = {
      'french': 'FR',
      'english': 'GB',
      'swahili': 'KE',
      'yoruba': 'NG',
      'igbo': 'NG',
      'hausa': 'NG',
      'zulu': 'ZA',
      'xhosa': 'ZA',
      'amharic': 'ET',
      'somali': 'SO',
      'wolof': 'SN',
      'mandinka': 'GM',
      'bambara': 'ML',
      'fula': 'GN',
      'twi': 'GH',
      'ewe': 'GH',
      'ga': 'GH',
      'akan': 'GH',
    };

    const countryCode = languageToCountry[languageCode.toLowerCase()];
    if (!countryCode) return '';

    try {
      const codePoints = countryCode
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '';
    }
  };

  const displayLanguage = selectedLanguage 
    ? getLanguageName(selectedLanguage)
    : t('search.allLanguages');

  const displayFlag = selectedLanguage ? getLanguageFlag(selectedLanguage) : '';

  const handleLanguageSelect = (language: string | null) => {
    onLanguageSelect(language);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: string | null }) => {
    const isSelected = item === selectedLanguage;
    const languageName = item ? getLanguageName(item) : t('search.allLanguages');
    const flag = item ? getLanguageFlag(item) : '';

    return (
      <TouchableOpacity
                  style={[
            styles.languageItem,
            { 
              backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent',
              borderBottomColor: '#f0f0f0'
            }
          ]}
        onPress={() => handleLanguageSelect(item)}
      >
        <View style={styles.languageItemContent}>
          {flag ? <Text style={styles.flagText}>{flag}</Text> : null}
          <Text style={[
            styles.languageItemText,
            { 
              color: isSelected ? theme.colors.primary : theme.colors.onSurface,
              fontWeight: isSelected ? '600' : '400'
            }
          ]}>
            {languageName}
          </Text>
        </View>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.filterContent}>
          {displayFlag ? <Text style={styles.flagText}>{displayFlag}</Text> : null}
          <Text style={[styles.filterText, { color: theme.colors.onSurface }]}>
            {displayLanguage}
          </Text>
          <Text style={[styles.arrow, { color: theme.colors.onSurfaceVariant }]}>▼</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: '#f0f0f0' }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeText, { color: theme.colors.onSurface }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {t('search.selectLanguage')}
            </Text>
          </View>

          <FlatList
            data={[null, ...availableLanguages]}
            keyExtractor={(item) => item || 'all'}
            renderItem={renderLanguageItem}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 18,
    marginRight: 8,
    fontFamily: 'Baloo2_400Regular',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'Baloo2_400Regular',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
    flex: 1,
    textAlign: 'center',
    marginRight: 26, // Compensate for close button
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageItemText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default LanguageFilter;
