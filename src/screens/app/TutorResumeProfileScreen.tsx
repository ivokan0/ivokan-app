import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme, Divider } from 'react-native-paper';

import { getTutorResume } from '../../services/resume';
import { TutorResume } from '../../types/database';

type TutorResumeProfileRoute = RouteProp<
  { TutorResumeProfile: { tutorId: string; tutorName?: string } },
  'TutorResumeProfile'
>;

const TutorResumeProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<TutorResumeProfileRoute>();
  const { tutorId } = route.params as any;

  const [items, setItems] = React.useState<TutorResume[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const load = async () => {
      if (!tutorId) return;
      setLoading(true);
      const { data } = await getTutorResume(tutorId);
      setItems(data || []);
      setLoading(false);
    };
    load();
  }, [tutorId]);

  const formatYearRange = (start?: number, end?: number) => {
    if (!start && !end) return '';
    if (start && end) return `${start} — ${end}`;
    return `${start ?? end}`;
  };

  const SectionList = ({
    title,
    data,
  }: {
    title: string;
    data: TutorResume[];
  }) => {
    if (!data || data.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{title}</Text>
        {data.map((item, index) => (
          <View key={item.id} style={styles.itemWrapper}>
            <View style={styles.yearRow}>
              <Text style={[styles.yearText, { color: theme.colors.onSurfaceVariant }]}>
                {formatYearRange(item.start_year, item.end_year)}
              </Text>
            </View>
            <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}> 
              {item.type === 'work_experience' && (item.company_name || '')}
              {item.type === 'education' && (item.institution_name || '')}
              {item.type === 'certification' && (item.certificate_name || '')}
            </Text>
            <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}> 
              {item.type === 'work_experience' && (item.position || '')}
              {item.type === 'education' && (item.field_of_study || item.degree_level || '')}
              {item.type === 'certification' && (item.issuing_organization || '')}
            </Text>
            {index < data.length - 1 && <Divider style={styles.itemDivider} />}
          </View>
        ))}
      </View>
    );
  };

  const work = items.filter((i) => i.type === 'work_experience');
  const education = items.filter((i) => i.type === 'education');
  const certs = items.filter((i) => i.type === 'certification');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
              {t('common.loading')}
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              {t('resume.noItems')}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <SectionList title={t('resume.workExperience')} data={work} />
            {work.length > 0 && (education.length > 0 || certs.length > 0) && (
              <View style={styles.sectionSeparator} />
            )}
            <SectionList title={t('resume.education')} data={education} />
            {education.length > 0 && certs.length > 0 && (
              <View style={styles.sectionSeparator} />
            )}
            <SectionList title={t('resume.certification')} data={certs} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginBottom: 12,
  },
  itemWrapper: {
    paddingVertical: 8,
  },
  yearRow: {
    marginBottom: 4,
  },
  yearText: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_700Bold',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
  },
  itemDivider: {
    marginTop: 12,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
});

export default TutorResumeProfileScreen;


