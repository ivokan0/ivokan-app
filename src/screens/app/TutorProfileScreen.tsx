import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { TutorWithStats, ReviewWithProfiles } from '../../types/database';
import YouTubePlayer from '../../components/ui/YouTubePlayer';
import ReviewCard from '../../components/ReviewCard';
import BottomActionBar from '../../components/ui/BottomActionBar';
import { getReviewsWithProfiles } from '../../services/reviews';
import { getOrCreateConversation } from '../../services/messaging';
import { useAuth } from '../../hooks/useAuth';

type TutorProfileScreenProps = {
  route: RouteProp<{ TutorProfile: { tutor: TutorWithStats } }, 'TutorProfile'>;
};

const getFlagFromCountryCode = (countryCode?: string | null): string => {
  if (!countryCode) return '';
  const upper = countryCode.toUpperCase();
  if (upper.length !== 2) return '';
  try {
    const codePoints = upper.split('').map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
};

const TutorProfileScreen: React.FC<TutorProfileScreenProps> = ({ route }) => {
  const { tutor } = route.params;
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [showFullBio, setShowFullBio] = React.useState(false);
  const [reviews, setReviews] = React.useState<ReviewWithProfiles[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const shareProfile = async () => {
    try {
      const profileUrl = tutor.profile_link 
        ? `https://ivokan.com/tutor/${tutor.profile_link}`
        : `https://ivokan.com/tutor/${tutor.id}`;
      
      await Share.share({
        message: t('tutorProfile.shareMessage', { 
          name: displayName,
          url: profileUrl 
        }),
        url: profileUrl,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('tutorProfile.shareError'));
    }
  };

  const handleChatPress = async () => {
    if (!user?.id) {
      // Handle not logged in case
      return;
    }

    try {
      // Get or create conversation
      const { data: conversation, error } = await getOrCreateConversation(
        tutor.user_id,
        user.id,
        user.id
      );

      if (error) {
        console.error('Error creating conversation:', error);
        return;
      }

      if (conversation) {
        // Navigate to Messages tab and open the conversation
        (navigation as any).navigate('Main', { 
          screen: 'Messages',
          params: { conversationId: conversation.id }
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleBuyTrialPress = () => {
    // TODO: Navigate to trial lesson purchase screen
    console.log('Navigate to buy trial lesson for tutor:', tutor.user_id);
  };

  const firstName = tutor.first_name || '';
  const lastInitial = tutor.last_name ? `${tutor.last_name.charAt(0)}.` : '';
  const displayName = `${firstName} ${lastInitial}`.trim();
  const countryFlag = getFlagFromCountryCode(tutor.country_birth || undefined);

  // Get the first letter of the tutor's name for avatar fallback
  const getTutorInitial = () => {
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (tutor.last_name) return tutor.last_name.charAt(0).toUpperCase();
    return '?';
  };

  // Load reviews when component mounts
  React.useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const { data, error } = await getReviewsWithProfiles(tutor.user_id);
        if (error) {
          console.error('Error loading reviews:', error);
        } else {
          setReviews(data || []);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [tutor.user_id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={shareProfile}
          style={[styles.headerButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Presentation Video */}
        {tutor.presentation_video_url && (
          <View style={styles.videoContainer}>
            <YouTubePlayer videoUrl={tutor.presentation_video_url} height={220} />
          </View>
        )}

        {/* Profile Information */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {tutor.avatar_url ? (
              <Image
                source={{ uri: tutor.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.avatarInitial, { color: theme.colors.onPrimary }]}>
                  {getTutorInitial()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={2}>
                  {displayName}
                </Text>
                <View style={styles.verified}>
                  <MaterialCommunityIcons name="check" size={12} color="#fff" />
                </View>
              </View>
              
              <View style={styles.countryContainer}>
                <Text style={[styles.countryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('tutorProfile.countryOfBirth')}
                </Text>
                <View style={styles.countryRow}>
                  {countryFlag && <Text style={styles.flag}>{countryFlag}</Text>}
                  <Text style={[styles.country, { color: theme.colors.onSurface }]}>
                    {tutor.country_birth ? t(`countries.${tutor.country_birth.toLowerCase()}`) : t('common.notSpecified')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Statistics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {tutor.tutor_stats?.average_rating?.toFixed?.(1) ?? '0.0'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.rating')}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="message-text" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {formatNumber(tutor.tutor_stats?.total_reviews ?? 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.reviews')}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {formatNumber(tutor.tutor_stats?.total_students ?? 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.students')}
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>
                {formatNumber(tutor.tutor_stats?.total_lessons ?? 0)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.lessons')}
              </Text>
            </View>
          </View>
        </View>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: '#E0E0E0' }]} />

        {/* About Me Section */}
        {tutor.biography && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('tutorProfile.aboutMe')}
            </Text>
            <Text style={[styles.biography, { color: theme.colors.onSurface }]}>
              {showFullBio ? tutor.biography : `${tutor.biography.slice(0, 150)}${tutor.biography.length > 150 ? '...' : ''}`}
            </Text>
            {tutor.biography.length > 150 && (
              <TouchableOpacity 
                onPress={() => setShowFullBio(!showFullBio)}
                style={[styles.readMoreButton, { borderColor: '#E0E0E0' }]}
              >
                <Text style={[styles.readMoreText, { color: theme.colors.onSurface }]}>
                  {showFullBio ? t('tutorProfile.readLess') : t('tutorProfile.readMore')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Separator */}
        {tutor.biography && tutor.spoken_languages?.length > 0 && (
          <View style={[styles.separator, { backgroundColor: '#E0E0E0' }]} />
        )}

        {/* I speak Section */}
        {tutor.spoken_languages?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('tutorProfile.iSpeak')}
            </Text>
            
            <View style={styles.spokenLanguagesContainer}>
              {tutor.spoken_languages.map((lang, index) => {
                const proficiency = (tutor.languages_proficiency as any)?.[lang]?.level;
                const proficiencyLabel = proficiency ? t(`languages.levels.${proficiency}`) : '';
                const languageName = lang.charAt(0).toUpperCase() + lang.slice(1);
                
                return (
                  <View key={index} style={styles.spokenLanguageItem}>
                    <View style={styles.spokenLanguageRow}>
                      <Text style={[styles.spokenLanguageName, { color: theme.colors.onSurface }]}>
                        {languageName}
                      </Text>
                      <View style={[
                        styles.proficiencyBadge, 
                        { 
                          backgroundColor: proficiency === 'native' ? '#E8F5E8' : '#E3F2FD'
                        }
                      ]}>
                        <Text style={[
                          styles.proficiencyText, 
                          { 
                            color: proficiency === 'native' ? '#2E7D32' : '#1976D2'
                          }
                        ]}>
                          {proficiencyLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Separator */}
        {tutor.spoken_languages?.length > 0 && (
          <View style={[styles.separator, { backgroundColor: '#E0E0E0' }]} />
        )}

        {/* Super Tutor Badge */}
        {tutor.super_tutor && (
          <View style={styles.section}>
            <View style={styles.superTutorContainer}>
              <View style={styles.superTutorHeader}>
                <View style={[styles.superTutorBadge, { backgroundColor: '#FF6B9D' }]}>
                  <MaterialCommunityIcons name="star" size={16} color="#fff" />
                </View>
                <Text style={[styles.superTutorTitle, { color: '#FF6B9D' }]}>
                  {t('tutor.super_tutor')}
                </Text>
              </View>
              <Text style={[styles.superTutorDescription, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.superTutorDescription', { name: displayName })}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('SuperTutorInfo' as never)}
                style={styles.learnMoreButton}
              >
                <Text style={[styles.learnMoreText, { color: theme.colors.onSurface }]}>
                  {t('tutorProfile.learnMore')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Separator */}
        {tutor.super_tutor && (
          <View style={[styles.separator, { backgroundColor: '#E0E0E0' }]} />
        )}

        {/* Resume entry - visible as a row to open full resume */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('TutorResumeProfile', { tutorId: tutor.id, tutorName: displayName })}
            style={styles.resumeRow}
          >
            <Text style={[styles.resumeTitle, { color: theme.colors.onSurface }]}>
              {t('resume.title')}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* Separator */}
        {(tutor.super_tutor || tutor.spoken_languages?.length > 0 || tutor.biography) && (
          <View style={[styles.separator, { backgroundColor: '#E0E0E0' }]} />
        )}

        {/* Reviews Section - Only show if there are reviews */}
        {!loadingReviews && reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              {t('tutorProfile.whatStudentsSay')}
            </Text>

            {/* Overall Rating Display */}
            <View style={styles.overallRatingContainer}>
              <View style={styles.ratingRow}>
                <Text style={[styles.overallRating, { color: theme.colors.onSurface }]}>
                  {tutor.tutor_stats?.average_rating?.toFixed?.(1) ?? '0.0'}
                </Text>
                <Image
                  source={require('../../../assets/star-coin.png')}
                  style={styles.starIcon}
                />
              </View>
              <Text style={[styles.basedOnText, { color: theme.colors.onSurfaceVariant }]}>
                {t('tutorProfile.basedOnReviews', { count: reviews.length })}
              </Text>
            </View>

            {/* Horizontal Scrollable Reviews */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalReviewsContainer}
              style={styles.horizontalReviewsScroll}
            >
              {reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewCardWrapper}>
                  <ReviewCard review={review} />
                </View>
              ))}
            </ScrollView>

            {/* Show All Reviews Button */}
            <TouchableOpacity 
              style={[styles.showAllReviewsButton, { borderColor: theme.colors.outline }]}
              onPress={() => {
                (navigation as any).navigate('ReviewScreen', { 
                  tutorId: tutor.user_id,
                  tutorName: displayName,
                  reviews: reviews 
                });
              }}
            >
              <Text style={[styles.showAllReviewsText, { color: theme.colors.onSurface }]}>
                {t('tutorProfile.showAllReviews', { count: reviews.length })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar
        onChatPress={handleChatPress}
        onBuyTrialPress={handleBuyTrialPress}
      />
    </View>
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
    paddingVertical: 12,
    paddingTop: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    padding: 20,
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e9e9e9',
    marginRight: 16,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
    marginRight: 8,
    flex: 1,
  },
  verified: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryContainer: {
    flex: 1,
  },
  countryLabel: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    marginBottom: 4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  country: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Baloo2_400Regular',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Baloo2_700Bold',
    marginBottom: 12,
  },
  biography: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#fff',
    width: '100%',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    fontWeight: '600',
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  resumeTitle: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  spokenLanguagesContainer: {
    gap: 12,
  },
  spokenLanguageItem: {
    paddingVertical: 4,
  },
  spokenLanguageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spokenLanguageName: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    flex: 1,
  },
  proficiencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proficiencyText: {
    fontSize: 14,
    fontFamily: 'Baloo2_600SemiBold',
    textTransform: 'capitalize',
  },
  superTutorContainer: {
    gap: 8,
  },
  superTutorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  superTutorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  superTutorTitle: {
    fontSize: 18,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
  },
  superTutorDescription: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    lineHeight: 20,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: 'Baloo2_400Regular',
    textDecorationLine: 'underline',
  },
  overallRatingContainer: {
    marginBottom: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallRating: {
    fontSize: 48,
    fontFamily: 'Baloo2_700Bold',
    fontWeight: '700',
    marginRight: 8,
  },
  starIcon: {
    width: 60,
    height: 60,
    marginLeft: -10,
  },
  basedOnText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
  },
  horizontalReviewsScroll: {
    marginBottom: 20,
  },
  horizontalReviewsContainer: {
    paddingLeft: 0,
    paddingRight: 16,
  },
  reviewCardWrapper: {
    width: 320,
    marginRight: 16,
  },
  showAllReviewsButton: {
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  showAllReviewsText: {
    fontSize: 16,
    fontFamily: 'Baloo2_600SemiBold',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Baloo2_400Regular',
    marginTop: 12,
  },
});

export default TutorProfileScreen;
