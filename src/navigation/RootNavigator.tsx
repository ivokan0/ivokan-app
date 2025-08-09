import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/SplashScreen';
import { LoginScreen, SignupScreen, ForgotPasswordScreen, ResetPasswordScreen } from '../screens/auth';
import { HomeScreen, ProfileScreen, SettingsScreen } from '../screens/app';
import { useAuth } from '../hooks/useAuth';
import WelcomeScreen from '../screens/WelcomeScreen';
 
import { AppProvider, useApp } from '../contexts/AppContext';
import { IconButton } from 'react-native-paper';

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
  Welcome: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerRight: () => (
          <IconButton icon="bell-outline" size={22} onPress={() => {}} accessibilityLabel="Notifications" />
        ),
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home.title') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </Tab.Navigator>
  );
};

const AuthStackNavigator: React.FC = () => {
  const { t } = useTranslation();
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: t('auth.login.title') }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: t('auth.signup.title') }} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: t('auth.forgot.title') }}
      />
      <AuthStack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: t('auth.reset.title') }}
      />
    </AuthStack.Navigator>
  );
};

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

const RootNavigatorInner: React.FC = () => {
  const { isRestoring, user } = useAuth();
  const { showWelcome, setShowWelcome } = useApp();

  if (isRestoring) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Splash" component={SplashScreen} />
      </RootStack.Navigator>
    );
  }

  // If not authenticated, show Welcome first every time. After Get Started -> Auth stack
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
        <RootStack.Screen name="App" component={AppTabs} />
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


