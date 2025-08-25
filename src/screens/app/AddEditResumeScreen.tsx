import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button, Checkbox } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import AppTextInput from '../../components/ui/AppTextInput';
import AppButton from '../../components/ui/AppButton';
import { createTutorResume, updateTutorResume } from '../../services/resume';
import { TutorResume } from '../../types/database';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AddEditResumeScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, profile } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  
  const editingItem = (route.params as any)?.item as TutorResume | undefined;
  const isEditing = !!editingItem;

  // Form state
  const [type, setType] = useState<'education' | 'work_experience' | 'certification'>(
    editingItem?.type || 'education'
  );
  const [institutionName, setInstitutionName] = useState(editingItem?.institution_name || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(editingItem?.field_of_study || '');
  const [degreeLevel, setDegreeLevel] = useState(editingItem?.degree_level || '');
  const [companyName, setCompanyName] = useState(editingItem?.company_name || '');
  const [position, setPosition] = useState(editingItem?.position || '');
  const [certificateName, setCertificateName] = useState(editingItem?.certificate_name || '');
  const [issuingOrganization, setIssuingOrganization] = useState(editingItem?.issuing_organization || '');
  const [startYear, setStartYear] = useState(editingItem?.start_year?.toString() || '');
  const [endYear, setEndYear] = useState(editingItem?.end_year?.toString() || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [isCurrent, setIsCurrent] = useState(editingItem?.end_year === new Date().getFullYear());
  const [showEndYear, setShowEndYear] = useState(!!editingItem?.end_year);
  
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();

  const validateForm = (): boolean => {
    // Validate required fields based on type
    if (type === 'education') {
      if (!institutionName.trim()) {
        Alert.alert(t('errors.title'), t('resume.errors.required'));
        return false;
      }
    } else if (type === 'work_experience') {
      if (!companyName.trim()) {
        Alert.alert(t('errors.title'), t('resume.errors.required'));
        return false;
      }
    } else if (type === 'certification') {
      if (!certificateName.trim()) {
        Alert.alert(t('errors.title'), t('resume.errors.required'));
        return false;
      }
    }

    // Validate start year
    const startYearNum = parseInt(startYear);
    if (isNaN(startYearNum) || startYearNum < 1900 || startYearNum > currentYear) {
      Alert.alert(t('errors.title'), t('resume.errors.invalidYear'));
      return false;
    }

    // Validate end year if not current
    if (!isCurrent && endYear.trim()) {
      const endYearNum = parseInt(endYear);
      if (isNaN(endYearNum) || endYearNum < startYearNum || endYearNum > currentYear) {
        Alert.alert(t('errors.title'), t('resume.errors.endYearBeforeStart'));
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !profile?.id) return;

    setIsLoading(true);

    try {
      const resumeData = {
        tutor_id: profile.id,
        type,
        start_year: parseInt(startYear),
        end_year: showEndYear ? (isCurrent ? new Date().getFullYear() : (endYear.trim() ? parseInt(endYear) : undefined)) : undefined,
        description: description.trim() || undefined,
        
        // Education fields
        institution_name: type === 'education' ? institutionName.trim() : undefined,
        field_of_study: type === 'education' ? fieldOfStudy.trim() : undefined,
        degree_level: type === 'education' ? degreeLevel.trim() : undefined,
        
        // Work experience fields
        company_name: type === 'work_experience' ? companyName.trim() : undefined,
        position: type === 'work_experience' ? position.trim() : undefined,
        
        // Certification fields
        certificate_name: type === 'certification' ? certificateName.trim() : undefined,
        issuing_organization: type === 'certification' ? issuingOrganization.trim() : undefined,
      };

      if (isEditing && editingItem) {
        const { error } = await updateTutorResume(editingItem.id, resumeData);
        if (error) throw error;
      } else {
        const { error } = await createTutorResume(resumeData);
        if (error) throw error;
      }

      Alert.alert(
        t('profile.saveSuccess.title'),
        t('profile.saveSuccess.message'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving resume item:', error);
      Alert.alert(t('errors.title'), t('resume.errors.saveFailed'));
    } finally {
      setIsLoading(false);
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

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('resume.fields.type')}
      </Text>
      <View style={styles.typeSelector}>
        {(['education', 'work_experience', 'certification'] as const).map((typeOption) => (
          <TouchableOpacity
            key={typeOption}
            style={[
              styles.typeOption,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline
              }
            ]}
            onPress={() => setType(typeOption)}
          >
            <Checkbox
              status={type === typeOption ? 'checked' : 'unchecked'}
              onPress={() => setType(typeOption)}
              color={theme.colors.primary}
            />
            <MaterialCommunityIcons
              name={getTypeIcon(typeOption) as any}
              size={20}
              color={theme.colors.primary}
              style={styles.typeOptionIcon}
            />
            <Text style={[styles.typeOptionText, { color: theme.colors.onSurface }]}>
              {getTypeLabel(typeOption)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEducationFields = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons
          name="school"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('resume.education')}
        </Text>
      </View>
      <AppTextInput
        label={t('resume.fields.institutionName')}
        value={institutionName}
        onChangeText={setInstitutionName}
      />
      <AppTextInput
        label={t('resume.fields.fieldOfStudy')}
        value={fieldOfStudy}
        onChangeText={setFieldOfStudy}
      />
      <AppTextInput
        label={t('resume.fields.degreeLevel')}
        value={degreeLevel}
        onChangeText={setDegreeLevel}
      />
    </View>
  );

  const renderWorkExperienceFields = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons
          name="briefcase"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('resume.workExperience')}
        </Text>
      </View>
      <AppTextInput
        label={t('resume.fields.companyName')}
        value={companyName}
        onChangeText={setCompanyName}
      />
      <AppTextInput
        label={t('resume.fields.position')}
        value={position}
        onChangeText={setPosition}
      />
    </View>
  );

  const renderCertificationFields = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons
          name="certificate"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t('resume.certification')}
        </Text>
      </View>
      <AppTextInput
        label={t('resume.fields.certificateName')}
        value={certificateName}
        onChangeText={setCertificateName}
      />
      <AppTextInput
        label={t('resume.fields.issuingOrganization')}
        value={issuingOrganization}
        onChangeText={setIssuingOrganization}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            {isEditing ? t('resume.edit') : t('resume.add')}
          </Text>

          {renderTypeSelector()}

          {type === 'education' && renderEducationFields()}
          {type === 'work_experience' && renderWorkExperienceFields()}
          {type === 'certification' && renderCertificationFields()}

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="text"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('resume.fields.description')}
              </Text>
            </View>
            <AppTextInput
              label={t('resume.fields.description')}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('resume.fields.startYear')}
              </Text>
            </View>
            <AppTextInput
              label={t('resume.fields.startYear')}
              value={startYear}
              onChangeText={setStartYear}
              keyboardType="numeric"
            />
          </View>

          {!showEndYear && (
            <TouchableOpacity
              style={[styles.addEndYearButton, { borderColor: theme.colors.outline }]}
              onPress={() => setShowEndYear(true)}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.addEndYearText, { color: theme.colors.onSurfaceVariant }]}>
                {t('resume.fields.addEndYear')}
              </Text>
            </TouchableOpacity>
          )}

          {showEndYear && (
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                  {t('resume.fields.endYear')}
                </Text>
                <TouchableOpacity
                  style={styles.removeEndYearButton}
                  onPress={() => {
                    setShowEndYear(false);
                    setEndYear('');
                    setIsCurrent(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.currentOption}
                onPress={() => setIsCurrent(!isCurrent)}
              >
                <View style={[
                  styles.customCheckbox,
                  {
                    backgroundColor: isCurrent ? theme.colors.primary : 'transparent',
                    borderColor: theme.colors.outline
                  }
                ]}>
                  {isCurrent && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={theme.colors.onPrimary}
                    />
                  )}
                </View>
                <Text style={[styles.currentOptionText, { color: theme.colors.onSurface }]}>
                  {t('resume.fields.current')}
                </Text>
              </TouchableOpacity>

              {!isCurrent && (
                <AppTextInput
                  label={t('resume.fields.endYear')}
                  value={endYear}
                  onChangeText={setEndYear}
                  keyboardType="numeric"
                />
              )}
            </View>
          )}

          <View style={styles.footer}>
            <AppButton
              label={t('resume.save')}
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 12,
  },
  typeSelector: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeOptionIcon: {
    marginLeft: 12,
  },
  typeOptionText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 12,
    flex: 1,
  },
  addEndYearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addEndYearText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginLeft: 8,
  },
  removeEndYearButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  currentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  currentOptionText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 12,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default AddEditResumeScreen;
