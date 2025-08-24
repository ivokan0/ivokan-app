import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import TutorCard from '../../components/TutorCard';
import { TutorWithStats } from '../../types/database';
import { getTutorsWithStats } from '../../services/tutors';

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tutors, setTutors] = useState<TutorWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadTutors = useCallback(async () => {
    setLoading(true);
    const { data } = await getTutorsWithStats();
    setTutors(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTutors();
  }, [loadTutors]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <FlatList
        data={tutors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TutorCard tutor={item} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTutors} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
                {t('common.no_results') || 'No tutors found'}
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
