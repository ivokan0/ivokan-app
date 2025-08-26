// Database Types for Ivokan App
// ============================================

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
}

export interface BaseEntityWithUpdate extends BaseEntity {
  updated_at: string;
}

// Profile types (extended from existing)
export interface Profile extends BaseEntityWithUpdate {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  profile_type: 'student' | 'tutor';
  minimum_time_notice: number | null;
  biography: string | null;
  super_tutor: boolean;
  spoken_languages: string[];
  languages_proficiency: Record<string, any>;
  taught_languages: string[];
  proficiency_taught_lan: Record<string, any>;
  country_birth: string | null;
  presentation_video_url: string | null;
  profile_link: string | null;
}

// Tutor Stats
export interface TutorStats extends BaseEntityWithUpdate {
  tutor_id: string;
  total_reviews: number;
  average_rating: number;
  total_students: number;
  total_lessons: number;
}

// Languages
export interface Language extends BaseEntity {
  name: string;
  code: string;
}

// Subscription Plans
export interface SubscriptionPlan extends BaseEntity {
  name: string;
  duration_months: number;
  sessions_count: number;
  session_duration_minutes: number;
  price_eur: number;
  price_fcfa: number;
}

// Reviews
export interface Review extends BaseEntityWithUpdate {
  tutor_id: string;
  student_id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
}

// Student Subscriptions
export interface StudentSubscription extends BaseEntityWithUpdate {
  student_id: string;
  tutor_id: string;
  language_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  total_sessions: number;
  remaining_sessions: number;
  status: 'active' | 'expired';
}

// Trial Lessons
export interface TrialLesson extends BaseEntity {
  duration_minutes: number;
  price_eur: number;
  price_fcfa: number;
}

// Tutor Payment Methods (existing)
export interface TutorPaymentMethod extends BaseEntityWithUpdate {
  tutor_id: string;
  payment_type: 'orange_money' | 'wave' | 'mtn_money' | 'moov_money' | 'bank_transfer';
  account_number: string;
  account_name: string;
  is_default: boolean;
  bank_name: string | null;
  country: string;
}

// Tutor Resume
export interface TutorResume extends BaseEntityWithUpdate {
  tutor_id: string;
  type: 'education' | 'work_experience' | 'certification';
  
  // Education fields
  institution_name?: string;
  field_of_study?: string;
  degree_level?: string;
  
  // Work experience fields
  company_name?: string;
  position?: string;
  
  // Certification fields
  certificate_name?: string;
  issuing_organization?: string;
  
  // Common fields
  start_year: number;
  end_year?: number;
  description?: string;
}

// Extended types with relationships
export interface ProfileWithStats extends Profile {
  tutor_stats?: TutorStats;
}

export interface TutorWithStats extends Profile {
  tutor_stats: TutorStats;
  reviews: Review[];
  payment_methods: TutorPaymentMethod[];
}

export interface StudentWithSubscriptions extends Profile {
  subscriptions: StudentSubscriptionWithDetails[];
}

export interface ReviewWithProfiles extends Review {
  tutor: Profile;
  student: Profile;
}

export interface StudentSubscriptionWithDetails extends StudentSubscription {
  tutor: Profile;
  language: Language;
  plan: SubscriptionPlan;
}

// Create/Update types
export interface CreateProfileData {
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  timezone?: string;
  profile_type?: 'student' | 'tutor';
  minimum_time_notice?: number;
  biography?: string;
  super_tutor?: boolean;
  spoken_languages?: string[];
  languages_proficiency?: Record<string, any>;
  taught_languages?: string[];
  proficiency_taught_lan?: Record<string, any>;
  country_birth?: string;
}

export interface CreateReviewData {
  tutor_id: string;
  student_id: string;
  rating: number;
  comment?: string;
}

export interface CreateStudentSubscriptionData {
  student_id: string;
  tutor_id: string;
  language_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  total_sessions: number;
  remaining_sessions: number;
  status: 'active' | 'expired';
}

export interface CreateTutorPaymentMethodData {
  tutor_id: string;
  payment_type: 'orange_money' | 'wave' | 'mtn_money' | 'moov_money' | 'bank_transfer';
  account_number: string;
  account_name: string;
  is_default?: boolean;
  bank_name?: string;
  country: string;
}

export interface CreateTutorResumeData {
  tutor_id: string;
  type: 'education' | 'work_experience' | 'certification';
  
  // Education fields
  institution_name?: string;
  field_of_study?: string;
  degree_level?: string;
  
  // Work experience fields
  company_name?: string;
  position?: string;
  
  // Certification fields
  certificate_name?: string;
  issuing_organization?: string;
  
  // Common fields
  start_year: number;
  end_year?: number;
  description?: string;
}

export interface UpdateTutorResumeData {
  type?: 'education' | 'work_experience' | 'certification';
  
  // Education fields
  institution_name?: string;
  field_of_study?: string;
  degree_level?: string;
  
  // Work experience fields
  company_name?: string;
  position?: string;
  
  // Certification fields
  certificate_name?: string;
  issuing_organization?: string;
  
  // Common fields
  start_year?: number;
  end_year?: number;
  description?: string;
}

// Filter and query types
export interface TutorFilters {
  language_id?: string;
  min_rating?: number;
  super_tutor?: boolean;
  price_range?: {
    min: number;
    max: number;
  };
}

export interface SubscriptionFilters {
  student_id?: string;
  tutor_id?: string;
  status?: 'active' | 'expired';
  language_id?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Language proficiency levels
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'native';

export interface LanguageProficiency {
  [languageCode: string]: {
    level: ProficiencyLevel;
    yearsOfExperience?: number;
    certified?: boolean;
  };
}

// Spoken languages options
export const SPOKEN_LANGUAGES = ['french', 'english'] as const;
export type SpokenLanguage = typeof SPOKEN_LANGUAGES[number];

// Payment types
export const PAYMENT_TYPES = ['orange_money', 'wave', 'mtn_money', 'moov_money', 'bank_transfer'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

// Subscription status
export const SUBSCRIPTION_STATUS = ['active', 'expired'] as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[number];

// Profile types
export const PROFILE_TYPES = ['student', 'tutor'] as const;
export type ProfileType = typeof PROFILE_TYPES[number];

// Conversation and Message types
export interface Conversation extends BaseEntityWithUpdate {
  tutor_id: string;
  student_id: string;
  last_message: string | null;
  last_message_at: string | null;
}

export interface Message extends BaseEntity {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
}

export interface ConversationWithProfiles extends Conversation {
  tutor: Profile;
  student: Profile;
  messages: Message[];
  unread_count: number;
}

export interface MessageWithProfiles extends Message {
  sender: Profile;
  receiver: Profile;
}

// Create/Update types for conversations and messages
export interface CreateConversationData {
  tutor_id: string;
  student_id: string;
}

export interface CreateMessageData {
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

export interface UpdateMessageData {
  read_at?: string;
}

// Tutor Availability types
export interface TutorAvailability extends BaseEntityWithUpdate {
  tutor_id: string;
  type: 'weekly_availability' | 'unavailability';
  
  // Weekly availability fields
  day_of_week?: number; // 0-6 (Sunday-Saturday)
  start_time?: string;
  end_time?: string;
  
  // Unavailability fields
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  is_full_day?: boolean;
}

export interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface UnavailabilityPeriod {
  id?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_full_day: boolean;
}

export interface TutorAvailabilityView {
  tutor_id: string;
  type: 'weekly_availability' | 'unavailability';
  date_actual: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  unavailable_start_date?: string;
  unavailable_end_date?: string;
  is_full_day?: boolean;
  availability_id: string;
  status: 'available' | 'unavailable_full_day' | 'unavailable_partial' | 'unknown';
  available_slots?: { start_time: string; end_time: string }[];
}

export interface EffectiveAvailability {
  date_actual: string;
  available_slots: {
    start_time: string;
    end_time: string;
  }[];
}

// Create/Update types for availability
export interface CreateTutorAvailabilityData {
  tutor_id: string;
  type: 'weekly_availability' | 'unavailability';
  
  // Weekly availability fields
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  
  // Unavailability fields
  start_date?: string;
  end_date?: string;
  is_full_day?: boolean;
}

export interface UpdateTutorAvailabilityData {
  type?: 'weekly_availability' | 'unavailability';
  
  // Weekly availability fields
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  
  // Unavailability fields
  start_date?: string;
  end_date?: string;
  is_full_day?: boolean;
}
