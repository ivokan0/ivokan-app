import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/SplashScreen';
import { LoginScreen, SignupScreen, ForgotPasswordScreen, ResetPasswordScreen, SignupRoleScreen } from '../screens/auth';
import { HomeScreen, ProfileScreen, SettingsScreen } from '../screens/app';
import EditProfileScreen from '../screens/app/EditProfileScreen';
import LanguageSettingsScreen from '../screens/app/LanguageSettingsScreen';
import TimezoneSettingsScreen from '../screens/app/TimezoneSettingsScreen';
import CurrencySettingsScreen from '../screens/app/CurrencySettingsScreen';
import WebViewScreen from '../screens/app/WebViewScreen';
import { useAuth } from '../hooks/useAuth';
import WelcomeScreen from '../screens/WelcomeScreen';
 
import { AppProvider, useApp } from '../contexts/AppContext';
import { useTheme } from 'react-native-paper';
import SearchScreen from '../screens/student/SearchScreen';
import StudentMessagesScreen from '../screens/student/MessagesScreen';
import StudentScheduleScreen from '../screens/student/ScheduleScreen';
import SubscriptionsScreen from '../screens/student/SubscriptionsScreen';
import TutorHomeScreen from '../screens/tutor/HomeScreen';
import TutorMessagesScreen from '../screens/tutor/MessagesScreen';
import TutorScheduleScreen from '../screens/tutor/ScheduleScreen';
import EarningsScreen from '../screens/tutor/EarningsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProfileMenu from '../components/ProfileMenu';

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
  WebView: { url: string; title: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

const StudentTabs: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
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
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={TutorScheduleScreen}
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
          },
          headerBackTitle: t('common.back'),
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
            fontSize: 24,
            fontWeight: '600'
          },
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
            fontSize: 24,
            fontWeight: '600'
          },
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
            fontSize: 24,
            fontWeight: '600'
          },
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
            fontSize: 24,
            fontWeight: '600'
          },
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
            fontSize: 24,
            fontWeight: '600'
          },
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
            fontSize: 24,
            fontWeight: '600'
          },
        })}
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


