import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, Button, TextInput, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { getActiveSubscriptionsForTutor } from '../services/studentSubscriptions';
import { createSubscriptionBooking } from '../services/subscriptionBookings';
import { uploadLessonDocuments } from '../services/storage';
import { StudentSubscriptionWithDetails } from '../types/database';

interface CreateSubscriptionBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSubscriptionBookingModal: React.FC<CreateSubscriptionBookingModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<StudentSubscriptionWithDetails[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<StudentSubscriptionWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [duration, setDuration] = useState(90);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

  useEffect(() => {
    if (visible && user?.id) {
      loadSubscriptions();
    }
  }, [visible, user?.id]);

  const loadSubscriptions = async () => {
    if (!user?.id) return;

    try {
      setLoadingSubscriptions(true);
      const { data, error } = await getActiveSubscriptionsForTutor(user.id);
      
      if (error) {
        console.error('Error loading subscriptions:', error);
        Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert(t('common.error'), t('errors.subscription.loadFailed'));
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const calculateEndTime = (startTime: Date, durationMinutes: number) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newDocuments = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name || 'Document',
          type: asset.mimeType || 'application/octet-stream',
        }));
        setSelectedDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert(t('common.error'), t('errors.documents.pickFailed'));
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
        }));
        setSelectedDocuments(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert(t('common.error'), t('errors.documents.pickFailed'));
    }
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'file-pdf-box';
    } else if (type.startsWith('text/')) {
      return 'file-document';
    } else {
      return 'file';
    }
  };

  const getStudentInitial = (subscription: StudentSubscriptionWithDetails) => {
    if (!subscription.student) return '?';
    if (subscription.student.first_name) return subscription.student.first_name.charAt(0).toUpperCase();
    if (subscription.student.last_name) return subscription.student.last_name.charAt(0).toUpperCase();
    return '?';
  };

  const handleCreateBooking = async () => {
    if (!selectedSubscription || !user?.id) {
      Alert.alert(t('errors.validation.title'), t('errors.validation.selectSubscription'));
      return;
    }

    // Check if selected date is not in the past
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());
    
    if (selectedDateTime <= now) {
      Alert.alert(t('errors.validation.title'), t('errors.validation.futureDate'));
      return;
    }

    try {
      setIsLoading(true);
      let documentUrls: string[] = [];

      // Upload documents if any are selected
      if (selectedDocuments.length > 0) {
        setUploadingDocuments(true);
        const { data: uploadedUrls, error: uploadError } = await uploadLessonDocuments(selectedDocuments, user.id);
        
        if (uploadError) {
          console.error('Error uploading documents:', uploadError);
          Alert.alert(t('common.error'), t('errors.documents.uploadFailed'));
          return;
        }
        
        documentUrls = uploadedUrls || [];
        setUploadingDocuments(false);
      }

      const endTime = calculateEndTime(selectedTime, duration);
      
      const bookingData = {
        student_id: selectedSubscription.student_id,
        tutor_id: user.id,
        student_subscriptions_id: selectedSubscription.id,
        booking_date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        student_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tutor_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        tutor_notes: notes.trim() || undefined,
        lesson_documents_urls: documentUrls.length > 0 ? documentUrls : undefined,
      };

      const { data, error } = await createSubscriptionBooking(bookingData, user.id);
      
      if (error) {
        console.error('Error creating booking:', error);
        Alert.alert(t('common.error'), t('errors.booking.createFailed'));
      } else {
        Alert.alert(
          t('common.success'),
          t('tutor.agenda.bookingCreated'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                onSuccess();
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(t('common.error'), t('errors.booking.createFailed'));
    } finally {
      setIsLoading(false);
      setUploadingDocuments(false);
    }
  };

  const resetForm = () => {
    setSelectedSubscription(null);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setDuration(90);
    setNotes('');
    setSelectedDocuments([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {t('tutor.agenda.createBooking')}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Subscription Selection */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('tutor.agenda.selectSubscription')}
              </Text>
              
              {loadingSubscriptions ? (
                <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('common.loading')}...
                </Text>
              ) : subscriptions.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('tutor.agenda.noActiveSubscriptions')}
                </Text>
              ) : (
                subscriptions.map((subscription) => (
                  <TouchableOpacity
                    key={subscription.id}
                    style={[
                      styles.subscriptionItem,
                      selectedSubscription?.id === subscription.id && {
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                    onPress={() => setSelectedSubscription(subscription)}
                  >
                    <View style={styles.subscriptionInfo}>
                      <View style={styles.studentAvatarContainer}>
                        {subscription.student?.avatar_url ? (
                          <Image
                            source={{ uri: subscription.student.avatar_url }}
                            style={styles.studentAvatar}
                          />
                        ) : (
                          <View style={[styles.studentAvatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.studentAvatarText, { color: theme.colors.onPrimary }]}>
                              {getStudentInitial(subscription)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.studentDetails}>
                        <Text style={[styles.studentName, { color: theme.colors.onSurface }]}>
                          {subscription.student?.first_name} {subscription.student?.last_name}
                        </Text>
                        <Text style={[styles.languageName, { color: theme.colors.onSurfaceVariant }]}>
                          {subscription.language?.name}
                        </Text>
                        <Text style={[styles.planInfo, { color: theme.colors.onSurfaceVariant }]}>
                          {subscription.plan?.name} • {subscription.remaining_sessions} {t('tutor.agenda.sessionsRemaining')}
                        </Text>
                      </View>
                    </View>
                    {selectedSubscription?.id === subscription.id && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Card.Content>
          </Card>

          {/* Date and Time Selection */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('tutor.agenda.dateAndTime')}
              </Text>

              {/* Date Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.pickerText, { color: theme.colors.onSurface }]}>
                  {formatDate(selectedDate)}
                </Text>
              </TouchableOpacity>

              {/* Time Picker */}
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.pickerText, { color: theme.colors.onSurface }]}>
                  {formatTime(selectedTime)}
                </Text>
              </TouchableOpacity>

                             {/* Duration Selection */}
               <View style={styles.durationContainer}>
                 <Text style={[styles.durationLabel, { color: theme.colors.onSurfaceVariant }]}>
                   {t('tutor.agenda.duration')}:
                 </Text>
                 <View style={styles.durationButtons}>
                   <TouchableOpacity
                     style={[
                       styles.durationButton,
                       {
                         backgroundColor: theme.colors.primary,
                       },
                     ]}
                   >
                     <Text
                       style={[
                         styles.durationButtonText,
                         { color: theme.colors.onPrimary },
                       ]}
                     >
                       {t('tutor.agenda.oneHourThirty')}
                     </Text>
                   </TouchableOpacity>
                 </View>
               </View>

              {/* End Time Display */}
              <View style={styles.endTimeContainer}>
                <Text style={[styles.endTimeLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('tutor.agenda.endTime')}:
                </Text>
                <Text style={[styles.endTimeText, { color: theme.colors.onSurface }]}>
                  {formatTime(calculateEndTime(selectedTime, duration))}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Notes */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('tutor.agenda.notes')}
              </Text>
              <TextInput
                mode="outlined"
                value={notes}
                onChangeText={setNotes}
                placeholder={t('tutor.agenda.notesPlaceholder')}
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            </Card.Content>
          </Card>

          {/* Documents */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('tutor.agenda.documents')}
              </Text>
              
              {/* Document Selection Buttons */}
              <View style={styles.documentButtons}>
                <Button
                  mode="outlined"
                  onPress={pickDocuments}
                  icon="file-plus"
                  style={styles.documentButton}
                  disabled={uploadingDocuments}
                >
                  {t('tutor.agenda.selectDocuments')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={pickImages}
                  icon="image-plus"
                  style={styles.documentButton}
                  disabled={uploadingDocuments}
                >
                  {t('tutor.agenda.selectImages')}
                </Button>
              </View>

              {/* Selected Documents List */}
              {selectedDocuments.length > 0 && (
                <View style={styles.documentsList}>
                  <Text style={[styles.documentsLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('tutor.agenda.selectedDocuments')} ({selectedDocuments.length}):
                  </Text>
                  {selectedDocuments.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                      <View style={styles.documentInfo}>
                        <MaterialCommunityIcons
                          name={getFileIcon(doc.type) as any}
                          size={20}
                          color={theme.colors.primary}
                        />
                        <Text style={[styles.documentName, { color: theme.colors.onSurface }]} numberOfLines={1}>
                          {doc.name}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeDocument(index)}
                        style={styles.removeButton}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={20}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Upload Progress */}
              {uploadingDocuments && (
                <View style={styles.uploadProgress}>
                  <Text style={[styles.uploadText, { color: theme.colors.primary }]}>
                    {t('tutor.agenda.uploadingDocuments')}...
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateBooking}
            loading={isLoading}
            disabled={!selectedSubscription || isLoading}
            style={styles.createButton}
          >
            {t('tutor.agenda.createBooking')}
          </Button>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            minuteInterval={5}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Baloo2_600SemiBold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  subscriptionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  studentAvatar: {
    width: '100%',
    height: '100%',
  },
  studentAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 18,
    fontFamily: 'Baloo2_600SemiBold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 2,
  },
  planInfo: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    fontStyle: 'italic',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  durationContainer: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    marginBottom: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  durationButtonText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  endTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  endTimeLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
  },
  endTimeText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
  },
  notesInput: {
    backgroundColor: 'transparent',
  },
  documentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  documentButton: {
    flex: 1,
  },
  documentsList: {
    marginTop: 8,
  },
  documentsLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginBottom: 6,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  documentName: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginLeft: 8,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  uploadProgress: {
    marginTop: 12,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'Baloo2_500Medium',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});

export default CreateSubscriptionBookingModal;
