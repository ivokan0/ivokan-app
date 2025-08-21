# Mobile Boilerplate (Expo + React Native + TypeScript + Clerk + Supabase)

A production-ready mobile starter built with Expo, React Native, TypeScript, Clerk Authentication, Supabase, React Navigation, react-i18next, AsyncStorage, and react-native-paper.

## Features
- Expo SDK 53 + TypeScript (strict mode)
- Navigation with stacks and tabs
  - SplashScreen while restoring session
  - AuthStack: Login, Signup, ForgotPassword, ResetPassword
  - AppTabs: Home, Profile, Settings
- **Clerk Authentication** (email/password + Google OAuth)
- **User Profiles** with automatic timezone detection
- Persisted sessions via SecureStore with auto-restore
- i18n (English/French) with react-i18next + expo-localization
- UI via react-native-paper (theming ready)
- Welcome screen carousel shown before authentication
- ESLint + Prettier

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Expo CLI (optional): `npm i -g expo-cli`
- Android Studio or Xcode for device simulators (optional)

### 1) Clone and install

"""bash
git clone https://github.com/ivokan0/app-boilerplate.git
cd app-boilerplate
npm install
"""

### 2) Configure environment
Create `.env` from the example and fill with your Clerk and Supabase credentials:

"""bash
cp env.example .env
"""

`.env`:

"""
# Clerk Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration (pour la table Profiles)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
"""

### 3) Run

"""bash
npm run android
# or
# Use a Mac for iOS simulator or Expo Go
echo "iOS requires macOS (or use Expo Go)"
npm run web
"""

If you see cache issues, try:

"""bash
npx expo start -c
"""

## Project Structure

"""
src/
  components/
    ui/                 # Reusable inputs/buttons
  contexts/
    AuthContext.tsx     # Auth state, signIn/signUp/signOut, OAuth
    AppContext.tsx      # In-memory welcome screen toggling
  hooks/
    useAuth.ts
  navigation/
    RootNavigator.tsx   # Splash -> Welcome/Auth -> App tabs
  screens/
    SplashScreen.tsx
    WelcomeScreen.tsx
    auth/
      LoginScreen.tsx
      SignupScreen.tsx
      ForgotPasswordScreen.tsx
      ResetPasswordScreen.tsx
    app/
      HomeScreen.tsx
      ProfileScreen.tsx
      SettingsScreen.tsx
  services/
    supabase.ts         # Supabase client
  translations/
    i18n.ts
    en.json
    fr.json
"""

## Key Implementation Notes

### Clerk Authentication
- Configuration in `src/services/clerk.ts` uses EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
- Auth context (`src/contexts/AuthContext.tsx`):
  - Restores session from SecureStore on launch
  - Listens to auth state changes and persists session
  - Email/password, Google, Apple sign-in methods
  - Automatic profile creation in Supabase

### User Profiles
- Profiles stored in Supabase table with automatic timezone detection
- Service in `src/services/profiles.ts` handles CRUD operations
- Hook `useProfile` provides easy access to profile data
- Automatic first_name/last_name population from OAuth providers

### i18n
- `src/translations/i18n.ts` initializes i18n immediately (English), then applies detected/stored language
- Use translations via `const { t } = useTranslation()` and `t('key.path')`
- Language switcher in `SettingsScreen` (uses `@react-native-picker/picker`)

### Navigation
- `RootNavigator` chooses screen set dynamically:
  - While auth is restoring: `Splash`
  - If signed out: `Welcome` then `AuthStack`
  - If signed in: `AppTabs`
- Custom header on tabs (left-aligned title + bell icon)
- Headers hidden on all auth screens

### UI Library
- react-native-paper is wrapped in `PaperProvider` (`App.tsx`)
- Reusable components:
  - `AppTextInput`: outlined input with optional error text
  - `AppButton`: button with loading indicator

### Gesture Handler and Safe Area
- `App.tsx` wraps the app in `GestureHandlerRootView` and `SafeAreaProvider`
- `index.ts` imports `react-native-gesture-handler`

### Linting & Formatting

"""bash
npm run lint
npm run format
"""

## Common Issues
- If you see reanimated/gesture errors, ensure:
  - Babel plugin order: `react-native-reanimated/plugin` is last in `babel.config.js`
  - The app is wrapped with `GestureHandlerRootView`
  - Clear the Metro cache: `npx expo start -c`

## Setup Instructions

### 1. Clerk Configuration
1. Create an account on [Clerk.com](https://clerk.com)
2. Create a new application
3. Configure OAuth providers (Google) in the dashboard
4. Add your publishable key to `.env`

### 2. Supabase Setup
1. Create a Supabase project
2. Run the SQL migration in `supabase/migrations/001_create_profiles_table.sql`
3. Add your Supabase credentials to `.env`

For detailed setup instructions, see [CLERK_SETUP.md](./CLERK_SETUP.md).

## Scripts
- `npm run android` – Start on Android
- `npm run ios` – Start on iOS (macOS only)
- `npm run web` – Start on web
- `npm run lint` – ESLint
- `npm run format` – Prettier

## Deployment
- Use EAS for building and submission:
  - `npm i -g eas-cli`
  - `eas login` and `eas build --platform android|ios`

## License
MIT

Avertissement Clerk: vous utilisez une clé de dev. En prod:
Remplacez EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY par la clé “production” depuis le dashboard Clerk.
Ajoutez les Redirect URLs côté Clerk:
Dev (Expo Go): exp://localhost:8081/--/sso-callback et exp://YOUR_LAN_IP:8081/--/sso-callback
Prod (builds): mobile-boilerplate://sso-callback (ou votre scheme personnalisé)