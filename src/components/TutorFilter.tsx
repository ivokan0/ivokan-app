import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ScrollView, Switch } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getCountryByCode, COUNTRIES } from '../utils/countries';

interface TutorFilters {
  countryOfBirth?: string | null;
  superTutor?: boolean;
  spokenLanguages?: string[];
  sortBy?: 'reviews' | 'rating' | null;
}

interface TutorFilterProps {
  filters: TutorFilters;
  onFiltersChange: (filters: TutorFilters) => void;
  availableCountries: string[];
}

const TutorFilter: React.FC<TutorFilterProps> = ({ filters, onFiltersChange, availableCountries }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<TutorFilters>(filters);

  const getCountryFlag = (countryCode: string) => {
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return '';
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.countryOfBirth) count++;
    if (filters.superTutor) count++;
    if (filters.spokenLanguages && filters.spokenLanguages.length > 0) count++;
    if (filters.sortBy) count++;
    return count;
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setModalVisible(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      countryOfBirth: null,
      superTutor: false,
      spokenLanguages: [],
      sortBy: null
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setModalVisible(false);
  };

  const handleCountrySelect = (countryCode: string | null) => {
    setTempFilters(prev => ({ ...prev, countryOfBirth: countryCode }));
  };

  const handleSpokenLanguageToggle = (language: string) => {
    setTempFilters(prev => {
      const currentLanguages = prev.spokenLanguages || [];
      const newLanguages = currentLanguages.includes(language)
        ? currentLanguages.filter(lang => lang !== language)
        : [...currentLanguages, language];
      return { ...prev, spokenLanguages: newLanguages };
    });
  };

  const spokenLanguageOptions = ['french', 'english'];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.filterButton, { backgroundColor: theme.colors.surface, borderColor: '#e0e0e0' }]}
        onPress={() => {
          setTempFilters(filters);
          setModalVisible(true);
        }}
      >
        <Text style={[styles.filterText, { color: theme.colors.onSurface }]}>
          {t('search.filters')}
        </Text>
        {activeFiltersCount > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.badgeText, { color: '#fff' }]}>{activeFiltersCount}</Text>
          </View>
        )}
        <Text style={[styles.arrow, { color: theme.colors.onSurfaceVariant }]}>⚙️</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: '#f0f0f0' }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeText, { color: theme.colors.onSurface }]}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {t('search.tutorFilters')}
            </Text>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Super Tutor Filter */}
            <View style={[styles.filterSection, { borderBottomColor: '#f0f0f0' }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('search.superTutor')}
              </Text>
              <Switch
                value={tempFilters.superTutor || false}
                onValueChange={(value) => setTempFilters(prev => ({ ...prev, superTutor: value }))}
                trackColor={{ false: '#e0e0e0', true: theme.colors.primary + '50' }}
                thumbColor={tempFilters.superTutor ? theme.colors.primary : '#f4f3f4'}
              />
            </View>

            {/* Country of Birth Filter */}
            <View style={[styles.filterSection, { borderBottomColor: '#f0f0f0' }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('search.countryOfBirth')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <TouchableOpacity
                  style={[
                    styles.countryOption,
                    { 
                      backgroundColor: !tempFilters.countryOfBirth ? theme.colors.primary + '20' : 'transparent',
                      borderColor: '#e0e0e0'
                    }
                  ]}
                  onPress={() => handleCountrySelect(null)}
                >
                  <Text style={[
                    styles.countryText,
                    { 
                      color: !tempFilters.countryOfBirth ? theme.colors.primary : theme.colors.onSurface 
                    }
                  ]}>
                    {t('search.allCountries')}
                  </Text>
                </TouchableOpacity>
                                 {availableCountries.map((countryCode) => {
                   const country = getCountryByCode(countryCode);
                   if (!country) return null;
                   return (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryOption,
                      { 
                        backgroundColor: tempFilters.countryOfBirth === country.code ? theme.colors.primary + '20' : 'transparent',
                        borderColor: '#e0e0e0'
                      }
                    ]}
                    onPress={() => handleCountrySelect(country.code)}
                  >
                    <Text style={styles.countryFlag}>{getCountryFlag(country.code)}</Text>
                                         <Text style={[
                       styles.countryText,
                       { 
                         color: tempFilters.countryOfBirth === country.code ? theme.colors.primary : theme.colors.onSurface 
                       }
                     ]}>
                       {t(`countries.${country.code.toLowerCase()}`) || country.name}
                                         </Text>
                   </TouchableOpacity>
                   );
                 })}
              </ScrollView>
                         </View>

             {/* Sort By Filter */}
             <View style={[styles.filterSection, { borderBottomColor: '#f0f0f0' }]}>
               <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                 {t('search.sortBy')}
               </Text>
               <View style={styles.sortGrid}>
                 <TouchableOpacity
                   style={[
                     styles.sortOption,
                     { 
                       backgroundColor: !tempFilters.sortBy ? theme.colors.primary + '20' : 'transparent',
                       borderColor: !tempFilters.sortBy ? theme.colors.primary : '#e0e0e0'
                     }
                   ]}
                   onPress={() => setTempFilters(prev => ({ ...prev, sortBy: null }))}
                 >
                   <Text style={[
                     styles.sortText,
                     { 
                       color: !tempFilters.sortBy ? theme.colors.primary : theme.colors.onSurface,
                       fontWeight: !tempFilters.sortBy ? '600' : '400'
                     }
                   ]}>
                     {t('search.defaultSort')}
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={[
                     styles.sortOption,
                     { 
                       backgroundColor: tempFilters.sortBy === 'rating' ? theme.colors.primary + '20' : 'transparent',
                       borderColor: tempFilters.sortBy === 'rating' ? theme.colors.primary : '#e0e0e0'
                     }
                   ]}
                   onPress={() => setTempFilters(prev => ({ ...prev, sortBy: 'rating' }))}
                 >
                   <Text style={[
                     styles.sortText,
                     { 
                       color: tempFilters.sortBy === 'rating' ? theme.colors.primary : theme.colors.onSurface,
                       fontWeight: tempFilters.sortBy === 'rating' ? '600' : '400'
                     }
                   ]}>
                     {t('search.sortByRating')}
                   </Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={[
                     styles.sortOption,
                     { 
                       backgroundColor: tempFilters.sortBy === 'reviews' ? theme.colors.primary + '20' : 'transparent',
                       borderColor: tempFilters.sortBy === 'reviews' ? theme.colors.primary : '#e0e0e0'
                     }
                   ]}
                   onPress={() => setTempFilters(prev => ({ ...prev, sortBy: 'reviews' }))}
                 >
                   <Text style={[
                     styles.sortText,
                     { 
                       color: tempFilters.sortBy === 'reviews' ? theme.colors.primary : theme.colors.onSurface,
                       fontWeight: tempFilters.sortBy === 'reviews' ? '600' : '400'
                     }
                   ]}>
                     {t('search.sortByReviews')}
                   </Text>
                 </TouchableOpacity>
               </View>
             </View>

             {/* Spoken Languages Filter */}
            <View style={[styles.filterSection, { borderBottomWidth: 0 }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('search.spokenLanguages')}
              </Text>
              <View style={styles.languageGrid}>
                {spokenLanguageOptions.map((language) => {
                  const isSelected = tempFilters.spokenLanguages?.includes(language) || false;
                  return (
                    <TouchableOpacity
                      key={language}
                      style={[
                        styles.languageOption,
                        { 
                          backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent',
                          borderColor: isSelected ? theme.colors.primary : '#e0e0e0'
                        }
                      ]}
                      onPress={() => handleSpokenLanguageToggle(language)}
                    >
                      <Text style={[
                        styles.languageText,
                        { 
                          color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                          fontWeight: isSelected ? '600' : '400'
                        }
                                             ]}>
                         {t(`languages.${language}`) || language.charAt(0).toUpperCase() + language.slice(1)}
                       </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { borderTopColor: '#f0f0f0', backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity
              style={[styles.footerButton, styles.clearButton, { borderColor: '#e0e0e0' }]}
              onPress={handleClearFilters}
            >
              <Text style={[styles.clearButtonText, { color: theme.colors.onSurface }]}>
                {t('search.clearFilters')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleApplyFilters}
            >
              <Text style={[styles.applyButtonText, { color: '#fff' }]}>
                {t('search.applyFilters')}
              </Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Baloo2_600SemiBold',
  },
  arrow: {
    fontSize: 16,
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
    fontFamily: 'Baloo2_600SemiBold',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    flex: 1,
    textAlign: 'center',
    marginRight: 26,
  },
  scrollContent: {
    flex: 1,
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 12,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  countryText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_500Medium',
  },
  applyButton: {
    // backgroundColor set dynamically
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default TutorFilter;
