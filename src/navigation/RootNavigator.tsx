import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import ProfileMenu from '../components/ProfileMenu';
import UnreadBadge from '../components/ui/UnreadBadge';
import { AppProvider, useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { HomeScreen, ProfileScreen, SettingsScreen, ReviewScreen, MyResumeScreen, AddEditResumeScreen, TutorResumeProfileScreen, ChatScreen } from '../screens/app';
import { LoginScreen, SignupScreen, ForgotPasswordScreen, ResetPasswordScreen, SignupRoleScreen } from '../screens/auth';
import SplashScreen from '../screens/SplashScreen';
import EditProfileScreen from '../screens/app/EditProfileScreen';
import LanguageSettingsScreen from '../screens/app/LanguageSettingsScreen';
import TimezoneSettingsScreen from '../screens/app/TimezoneSettingsScreen';
import CurrencySettingsScreen from '../screens/app/CurrencySettingsScreen';
import AvailabilitySettingsScreen from '../screens/app/AvailabilitySettingsScreen';
import AvailabilitySlotScreen from '../screens/app/AvailabilitySlotScreen';
import PaymentMethodsScreen from '../screens/app/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/app/AddPaymentMethodScreen';
import EditPaymentMethodScreen from '../screens/app/EditPaymentMethodScreen';
import MyLanguagesScreen from '../screens/app/MyLanguagesScreen';
import EditMyLanguagesScreen from '../screens/app/EditMyLanguagesScreen';
import WebViewScreen from '../screens/app/WebViewScreen';
import PresentationVideoScreen from '../screens/app/PresentationVideoScreen';
import TutorProfileScreen from '../screens/app/TutorProfileScreen';
import TutorOwnProfileScreen from '../screens/app/TutorOwnProfileScreen';
import SuperTutorInfoScreen from '../screens/app/SuperTutorInfoScreen';
import StudentMessagesScreen from '../screens/student/MessagesScreen';
import StudentScheduleScreen from '../screens/student/ScheduleScreen';
import SearchScreen from '../screens/student/SearchScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
 

import SubscriptionsScreen from '../screens/student/SubscriptionsScreen';
import TrialBookingScreen from '../screens/app/TrialBookingScreen';
import TrialBookingConfirmationScreen from '../screens/app/TrialBookingConfirmationScreen';
import SubscriptionBookingScreen from '../screens/app/SubscriptionBookingScreen';
import SubscriptionBookingConfirmationScreen from '../screens/app/SubscriptionBookingConfirmationScreen';
import StudentSubscriptionDetailsScreen from '../screens/app/StudentSubscriptionDetailsScreen';
import TutorStudentSubscriptionDetailsScreen from '../screens/tutor/StudentSubscriptionDetailsScreen';
import TutorSubscriptionsScreen from '../screens/tutor/SubscriptionsScreen';
import TutorHomeScreen from '../screens/tutor/HomeScreen';
import TutorMessagesScreen from '../screens/tutor/MessagesScreen';
import TutorScheduleScreen from '../screens/tutor/ScheduleScreen';
import TutorAgendaScreen from '../screens/tutor/AgendaScreen';
import EarningsScreen from '../screens/tutor/EarningsScreen';
import WithdrawalScreen from '../screens/tutor/WithdrawalScreen';


import { useUnreadMessages } from '../hooks/useUnreadMessages';

const CustomBackButton: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
      }}
    >
      <MaterialCommunityIcons
        name="arrow-left"
        size={24}
        color={theme.colors.onSurfaceVariant}
      />
    </TouchableOpacity>
  );
};

// Nouveau écran minimal d'attente profil
const ProfileBootScreen: React.FC = () => {
  return <SplashScreen />;
};

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
  Welcome: undefined;
};

type AppStackParamList = {
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
  LanguageSettings: undefined;
  TimezoneSettings: undefined;
  CurrencySettings: undefined;
  EditProfile: undefined;
  AvailabilitySettings: undefined;
  AvailabilitySlot: {
    mode: 'add' | 'edit';
    type: 'weekly_availability' | 'unavailability';
    availabilityId?: string;
    initialData?: any;
  };
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  EditPaymentMethod: { paymentMethod: any };
  MyLanguages: undefined;
  EditMyLanguages: { type: 'spoken' | 'taught' };
  WebView: { url: string; title: string };
  PresentationVideo: undefined;
  TutorProfile: { tutor: import('../types/database').TutorWithStats };
  TrialBooking: { tutorId: string; preselectedLanguage?: string };
  TrialBookingConfirmation: {
    tutor: { first_name?: string | null; last_name?: string | null; avatar_url?: string | null; average_rating?: number; total_reviews?: number };
    booking: { date: string; start_time: string; end_time: string; duration_minutes: number; price_eur: number; price_fcfa: number };
    bookingData: any;
  };
  SubscriptionBooking: { tutorId: string; languageCode: string; tutorName: string };
  SubscriptionBookingConfirmation: {
    tutor: { id: string; first_name?: string | null; last_name?: string | null; avatar_url?: string | null; average_rating?: number; total_reviews?: number };
    languageCode: string;
    selectedPlan: import('../types/database').SubscriptionPlan;
    tutorName: string;
  };
  StudentSubscriptionDetails: { subscriptionId: string };
  TutorStudentSubscriptionDetails: { subscriptionId: string };
  TutorSubscriptions: undefined;
  TutorOwnProfile: { tutor: import('../types/database').TutorWithStats };
  SuperTutorInfo: undefined;
  ReviewScreen: { tutorId: string; tutorName: string; reviews: import('../types/database').ReviewWithProfiles[] };
  MyResume: undefined;
  AddEditResume: { item?: import('../types/database').TutorResume };
  TutorResumeProfile: { tutorId: string; tutorName?: string };
  Chat: { conversationId: string };
  Withdrawal: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const StudentTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unreadCount } = useUnreadMessages();

  const MessageIconWithBadge = ({ color, size }: { color: string; size: number }) => (
    <View style={{ position: 'relative' }}>
      <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
      <UnreadBadge count={unreadCount} size="small" />
    </View>
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: { 
          fontFamily: 'Baloo2_600SemiBold',
          fontSize: 24,
          fontWeight: '600'
        },
        headerTintColor: theme.colors.primary,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleContainerStyle: {
          paddingLeft: 0,
          paddingTop: 10,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: 'Baloo2_600SemiBold' },
        headerRight: () => (
          <ProfileMenu userType="student" />
        ),
      }}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: t('student.search'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={StudentMessagesScreen}
        options={{
          title: t('student.messages'),
          tabBarIcon: ({ color, size }) => (
            <MessageIconWithBadge color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={StudentScheduleScreen}
        options={{
          title: t('student.schedule'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-blank" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{
          title: t('student.subscriptions'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card-multiple-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const TutorTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unreadCount } = useUnreadMessages();

  const MessageIconWithBadge = ({ color, size }: { color: string; size: number }) => (
    <View style={{ position: 'relative' }}>
      <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
      <UnreadBadge count={unreadCount} size="small" />
    </View>
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: { 
          fontFamily: 'Baloo2_600SemiBold',
          fontSize: 24,
          fontWeight: '600'
        },
        headerTintColor: theme.colors.primary,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleContainerStyle: {
          paddingLeft: 0,
          paddingTop: 10,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: 'Baloo2_600SemiBold' },
        headerRight: () => (
          <ProfileMenu userType="tutor" />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={TutorHomeScreen}
        options={{
          title: t('tutor.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={TutorMessagesScreen}
        options={{
          title: t('tutor.messages'),
          tabBarIcon: ({ color, size }) => (
            <MessageIconWithBadge color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={TutorAgendaScreen}
        options={{
          title: t('tutor.schedule'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-blank" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: t('tutor.earnings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const theme = useTheme();
  
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Main"
        component={profile?.profile_type === 'tutor' ? TutorTabs : StudentTabs}
        options={{ headerShown: false }}
      />
      <AppStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('profile.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: t('profile.editProfile'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          title: t('settings.language.label'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="TimezoneSettings"
        component={TimezoneSettingsScreen}
        options={{
          title: t('settings.timezone.selectTimezone'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="CurrencySettings"
        component={CurrencySettingsScreen}
        options={{
          title: t('settings.currency.selectCurrency'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="AvailabilitySettings"
        component={AvailabilitySettingsScreen}
        options={{
          title: t('settings.availability.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="AvailabilitySlot"
        component={AvailabilitySlotScreen}
        options={({ route }) => ({
          title: route.params?.mode === 'edit' ? t('settings.availability.editTitle') : t('settings.availability.addTitle'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        })}
      />
      <AppStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          title: t('settings.paymentMethods.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="AddPaymentMethod"
        component={AddPaymentMethodScreen}
        options={{
          title: t('settings.paymentMethods.addPaymentMethod'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="EditPaymentMethod"
        component={EditPaymentMethodScreen}
        options={{
          title: t('settings.paymentMethods.editPaymentMethod'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="MyLanguages"
        component={MyLanguagesScreen}
        options={{
          title: t('languages.myLanguages'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="EditMyLanguages"
        component={EditMyLanguagesScreen}
        options={{
          title: t('languages.editLanguages'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="WebView"
        component={WebViewScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Web',
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        })}
      />
      <AppStack.Screen
        name="PresentationVideo"
        component={PresentationVideoScreen}
        options={{
          title: t('profile.presentationVideo'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="TutorProfile"
        component={TutorProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="TutorOwnProfile"
        component={TutorOwnProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="TrialBooking"
        component={TrialBookingScreen}
        options={{
          title: t('booking.trialLessonTitle'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="TrialBookingConfirmation"
        component={TrialBookingConfirmationScreen}
        options={{
          title: t('booking.trialLessonTitle'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="SubscriptionBooking"
        component={SubscriptionBookingScreen}
        options={{
          title: t('subscription.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="SubscriptionBookingConfirmation"
        component={SubscriptionBookingConfirmationScreen}
        options={{
          title: t('subscription.title'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="StudentSubscriptionDetails"
        component={StudentSubscriptionDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="TutorStudentSubscriptionDetails"
        component={TutorStudentSubscriptionDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="TutorSubscriptions"
        component={TutorSubscriptionsScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="SuperTutorInfo"
        component={SuperTutorInfoScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="ReviewScreen"
        component={ReviewScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="MyResume"
        component={MyResumeScreen}
        options={{
          title: t('resume.title'),
          headerTitleStyle: {
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 20,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="TutorResumeProfile"
        component={TutorResumeProfileScreen}
        options={{
          title: t('resume.title'),
          headerTitleStyle: {
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 20,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="AddEditResume"
        component={AddEditResumeScreen}
        options={{
          title: t('resume.add'),
          headerTitleStyle: {
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 20,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
      <AppStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
      />
      <AppStack.Screen
        name="Withdrawal"
        component={WithdrawalScreen}
        options={{
          title: t('tutor.requestWithdrawal'),
          headerStyle: { 
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.primary,
          headerTitleStyle: { 
            fontFamily: 'Baloo2_600SemiBold',
            fontSize: 18,
            fontWeight: '600'
          },
          headerLeft: () => <CustomBackButton />,
        }}
      />
    </AppStack.Navigator>
  );
};

const AuthStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignupRole" component={SignupRoleScreen} options={{ title: t('auth.signup.title') }} />
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: t('auth.login.title') }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: t('auth.signup.title') }} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('auth.forgot.title') }} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: t('auth.reset.title') }} />
    </AuthStack.Navigator>
  );
};

const navTheme: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'white' },
};

const RootNavigatorInner: React.FC = () => {
  const { isLoaded, isSignedIn, user, profile } = useAuth();
  const { showWelcome, setShowWelcome } = useApp();
  const [minWaitOver, setMinWaitOver] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinWaitOver(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || !minWaitOver || (user && !profile)) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
      </RootStack.Navigator>
    );
  }

  if (!user && showWelcome) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Welcome">
          {() => <WelcomeScreen onDone={() => setShowWelcome(false)} />}
        </RootStack.Screen>
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      </RootStack.Navigator>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="App" component={AppStackNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

const RootNavigator: React.FC = () => (
  <NavigationContainer theme={navTheme}>
    <AppProvider>
      <RootNavigatorInner />
    </AppProvider>
  </NavigationContainer>
);

export default RootNavigator;


