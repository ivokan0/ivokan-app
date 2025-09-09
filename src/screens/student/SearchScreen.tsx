import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import LanguageFilter from '../../components/LanguageFilter';
import TutorCard from '../../components/TutorCard';
import TutorFilter from '../../components/TutorFilter';
import SearchScreenSkeleton from '../../components/ui/SearchScreenSkeleton';
import { getTutorsWithFilters, getAvailableTaughtLanguages, getAvailableCountries } from '../../services/tutors';
import { TutorWithStats } from '../../types/database';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const [tutors, setTutors] = useState<TutorWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMoreTutors, setHasMoreTutors] = useState<boolean>(true);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
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

  const loadTutors = useCallback(async (language?: string | null, filters?: typeof tutorFilters, offset: number = 0, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentOffset(0);
    }

    const { data } = await getTutorsWithFilters({
      language: language || undefined,
      superTutor: filters?.superTutor || undefined,
      countryOfBirth: filters?.countryOfBirth || undefined,
      spokenLanguages: filters?.spokenLanguages && filters.spokenLanguages.length > 0 ? filters.spokenLanguages : undefined,
      sortBy: filters?.sortBy || undefined,
      limit: 20,
      offset: offset
    });

    if (append) {
      setTutors(prevTutors => [...prevTutors, ...(data || [])]);
      setLoadingMore(false);
    } else {
      setTutors(data || []);
      setLoading(false);
    }

    // Check if there are more tutors to load
    setHasMoreTutors((data || []).length === 20);
    setCurrentOffset(offset + (data || []).length);
  }, []);

  const handleLanguageSelect = useCallback((language: string | null) => {
    setSelectedLanguage(language);
    loadTutors(language, tutorFilters);
  }, [loadTutors, tutorFilters]);

  const handleTutorFiltersChange = useCallback((filters: typeof tutorFilters) => {
    setTutorFilters(filters);
    loadTutors(selectedLanguage, filters);
  }, [loadTutors, selectedLanguage]);

  const loadMoreTutors = useCallback(() => {
    if (!loadingMore && hasMoreTutors) {
      loadTutors(selectedLanguage, tutorFilters, currentOffset, true);
    }
  }, [loadTutors, selectedLanguage, tutorFilters, currentOffset, loadingMore, hasMoreTutors]);

  useEffect(() => {
    loadAvailableLanguages();
    loadAvailableCountries();
    loadTutors();
  }, [loadAvailableLanguages, loadAvailableCountries, loadTutors]);

  // Show skeleton while loading
  if (loading) {
    return <SearchScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <TutorCard 
            tutor={item} 
            onPress={() => navigation.navigate('TutorProfile' as never, { tutor: item } as never)}
          />
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
        ListFooterComponent={
          hasMoreTutors && tutors.length > 0 ? (
            <View style={styles.loadMoreContainer}>
              <TouchableOpacity 
                style={[styles.loadMoreButton, { backgroundColor: theme.colors.primary }]}
                onPress={loadMoreTutors}
                disabled={loadingMore}
              >
                <Text style={[styles.loadMoreText, { color: theme.colors.onPrimary }]}>
                  {loadingMore ? t('search.loadingMore') || 'Chargement...' : t('search.loadMore') || 'Charger plus'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  listContent: { paddingVertical: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 64 },
  emptyText: { fontSize: 16, fontFamily: 'Baloo2_400Regular' },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
  },
});

export default SearchScreen;
