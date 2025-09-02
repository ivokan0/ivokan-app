import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme, Divider, FAB } from 'react-native-paper';

import MyResumeScreenSkeleton from '../../components/ui/MyResumeScreenSkeleton';
import { useAuth } from '../../hooks/useAuth';
import { getTutorResume, deleteTutorResume } from '../../services/resume';
import { TutorResume } from '../../types/database';

const MyResumeScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  
  const [resumeItems, setResumeItems] = useState<TutorResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResumeItems();
  }, []);

  const loadResumeItems = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    const { data, error } = await getTutorResume(profile.id);
    
    if (error) {
      console.error('Error loading resume items:', error);
    } else {
      setResumeItems(data || []);
    }
    
    setIsLoading(false);
  };

  const navigateToAddResume = () => {
    // @ts-ignore
    navigation.navigate('AddEditResume');
  };

  const navigateToEditResume = (item: TutorResume) => {
    // @ts-ignore
    navigation.navigate('AddEditResume', { item });
  };

  const handleDeleteResume = async (item: TutorResume) => {
    Alert.alert(
      t('resume.delete'),
      t('resume.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('resume.delete'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteTutorResume(item.id);
            if (error) {
              Alert.alert(t('errors.title'), t('resume.errors.deleteFailed'));
            } else {
              loadResumeItems();
            }
          }
        }
      ]
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'education':
        return t('resume.education');
      case 'work_experience':
        return t('resume.workExperience');
      case 'certification':
        return t('resume.certification');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'education':
        return 'school';
      case 'work_experience':
        return 'briefcase';
      case 'certification':
        return 'certificate';
      default:
        return 'file-document';
    }
  };

  const formatYearRange = (startYear: number, endYear?: number) => {
    if (endYear) {
      return `${startYear} - ${endYear}`;
    }
    return `${startYear}`;
  };

  const getItemTitle = (item: TutorResume) => {
    switch (item.type) {
      case 'education':
        return item.institution_name || t('resume.fields.institutionName');
      case 'work_experience':
        return item.company_name || t('resume.fields.companyName');
      case 'certification':
        return item.certificate_name || t('resume.fields.certificateName');
      default:
        return '';
    }
  };

  const getItemSubtitle = (item: TutorResume) => {
    switch (item.type) {
      case 'education':
        return item.field_of_study || item.degree_level || '';
      case 'work_experience':
        return item.position || '';
      case 'certification':
        return item.issuing_organization || '';
      default:
        return '';
    }
  };

  const ResumeItem = ({ item }: { item: TutorResume }) => (
    <View style={[styles.resumeItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.resumeItemHeader}>
        <View style={styles.resumeItemInfo}>
          <MaterialCommunityIcons
            name={getTypeIcon(item.type) as any}
            size={24}
            color={theme.colors.primary}
            style={styles.resumeItemIcon}
          />
          <View style={styles.resumeItemContent}>
            <Text style={[styles.resumeItemTitle, { color: theme.colors.onSurface }]}>
              {getItemTitle(item)}
            </Text>
            <Text style={[styles.resumeItemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {getItemSubtitle(item)}
            </Text>
            <Text style={[styles.resumeItemYear, { color: theme.colors.onSurfaceVariant }]}>
              {formatYearRange(item.start_year, item.end_year)}
            </Text>
          </View>
        </View>
        <View style={styles.resumeItemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToEditResume(item)}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteResume(item)}
          >
            <MaterialCommunityIcons
              name="delete"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
      {item.description && (
        <Text style={[styles.resumeItemDescription, { color: theme.colors.onSurfaceVariant }]}>
          {item.description}
        </Text>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={64}
        color={theme.colors.onSurfaceVariant}
        style={styles.emptyStateIcon}
      />
      <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
        {t('resume.noItems')}
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: theme.colors.onSurfaceVariant }]}>
        {t('resume.addFirstItem')}
      </Text>
    </View>
  );

  // Show skeleton while loading
  if (isLoading) {
    return <MyResumeScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {resumeItems.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={styles.content}>
            {resumeItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <ResumeItem item={item} />
                {index < resumeItems.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={navigateToAddResume}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  resumeItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  resumeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resumeItemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  resumeItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  resumeItemContent: {
    flex: 1,
  },
  resumeItemTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  resumeItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 2,
  },
  resumeItemYear: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
  },
  resumeItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  resumeItemDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 12,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MyResumeScreen;
