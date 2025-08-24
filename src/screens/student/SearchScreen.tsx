import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import TutorCard from '../../components/TutorCard';
import LanguageFilter from '../../components/LanguageFilter';
import TutorFilter from '../../components/TutorFilter';
import { TutorWithStats } from '../../types/database';
import { getTutorsWithFilters, getAvailableTaughtLanguages, getAvailableCountries } from '../../services/tutors';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tutors, setTutors] = useState<TutorWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [tutorFilters, setTutorFilters] = useState<{
    countryOfBirth?: string | null;
    superTutor?: boolean;
    spokenLanguages?: string[];
    sortBy?: 'reviews' | 'rating' | null;
  }>({
    countryOfBirth: null,
    superTutor: false,
    spokenLanguages: [],
    sortBy: null
  });

  const loadAvailableLanguages = useCallback(async () => {
    const { data } = await getAvailableTaughtLanguages();
    setAvailableLanguages(data || []);
  }, []);

  const loadAvailableCountries = useCallback(async () => {
    const { data } = await getAvailableCountries();
    setAvailableCountries(data || []);
  }, []);

  const loadTutors = useCallback(async (language?: string | null, filters?: typeof tutorFilters) => {
    setLoading(true);
    const { data } = await getTutorsWithFilters({
      language: language || undefined,
      superTutor: filters?.superTutor || undefined,
      countryOfBirth: filters?.countryOfBirth || undefined,
      spokenLanguages: filters?.spokenLanguages && filters.spokenLanguages.length > 0 ? filters.spokenLanguages : undefined,
      sortBy: filters?.sortBy || undefined
    });
    setTutors(data || []);
    setLoading(false);
  }, []);

  const handleLanguageSelect = useCallback((language: string | null) => {
    setSelectedLanguage(language);
    loadTutors(language, tutorFilters);
  }, [loadTutors, tutorFilters]);

  const handleTutorFiltersChange = useCallback((filters: typeof tutorFilters) => {
    setTutorFilters(filters);
    loadTutors(selectedLanguage, filters);
  }, [loadTutors, selectedLanguage]);

  useEffect(() => {
    loadAvailableLanguages();
    loadAvailableCountries();
    loadTutors();
  }, [loadAvailableLanguages, loadAvailableCountries, loadTutors]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <LanguageFilter
        availableLanguages={availableLanguages}
        selectedLanguage={selectedLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
      <TutorFilter
        filters={tutorFilters}
        onFiltersChange={handleTutorFiltersChange}
        availableCountries={availableCountries}
      />
      <FlatList
        data={tutors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TutorCard tutor={item} />
        )}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => loadTutors(selectedLanguage, tutorFilters)} 
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
                {t('search.noTutorsFound') || 'No tutors found'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 64 },
  emptyText: { fontSize: 16, fontFamily: 'Baloo2_400Regular' },
});

export default SearchScreen;
