import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import TutorCard from '../../components/TutorCard';
import LanguageFilter from '../../components/LanguageFilter';
import { TutorWithStats } from '../../types/database';
import { getTutorsWithFilters, getAvailableTaughtLanguages } from '../../services/tutors';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tutors, setTutors] = useState<TutorWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const loadAvailableLanguages = useCallback(async () => {
    const { data } = await getAvailableTaughtLanguages();
    setAvailableLanguages(data || []);
  }, []);

  const loadTutors = useCallback(async (language?: string | null) => {
    setLoading(true);
    const { data } = await getTutorsWithFilters({
      language: language || undefined
    });
    setTutors(data || []);
    setLoading(false);
  }, []);

  const handleLanguageSelect = useCallback((language: string | null) => {
    setSelectedLanguage(language);
    loadTutors(language);
  }, [loadTutors]);

  useEffect(() => {
    loadAvailableLanguages();
    loadTutors();
  }, [loadAvailableLanguages, loadTutors]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <LanguageFilter
        availableLanguages={availableLanguages}
        selectedLanguage={selectedLanguage}
        onLanguageSelect={handleLanguageSelect}
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
            onRefresh={() => loadTutors(selectedLanguage)} 
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
  emptyText: { fontSize: 16 },
});

export default SearchScreen;
