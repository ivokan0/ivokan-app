import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { setupI18n } from './src/translations/i18n';
import { ClerkConfig } from './src/services/clerk';
import React from 'react';
import { Text as RNText } from 'react-native';
import { useFonts, Baloo2_400Regular, Baloo2_600SemiBold } from '@expo-google-fonts/baloo-2';

export default function App() {
  const [fontsLoaded] = useFonts({ Baloo2_400Regular, Baloo2_600SemiBold });
  React.useEffect(() => {
    // Initialize i18n once on app startup
    setupI18n();
  }, []);
  const theme = React.useMemo(() => ({
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#f05728',
    },
    fonts: {
      ...DefaultTheme.fonts,
      titleLarge: { ...DefaultTheme.fonts.titleLarge, fontFamily: 'Baloo2_600SemiBold' },
      bodyLarge: { ...DefaultTheme.fonts.bodyLarge, fontFamily: 'Baloo2_400Regular' },
      bodyMedium: { ...DefaultTheme.fonts.bodyMedium, fontFamily: 'Baloo2_400Regular' },
      labelLarge: { ...DefaultTheme.fonts.labelLarge, fontFamily: 'Baloo2_600SemiBold' },
    },
  }), []);

  if (!fontsLoaded) {
    return null;
  }

  if (RNText.defaultProps == null) RNText.defaultProps = {} as any;
  RNText.defaultProps.style = [RNText.defaultProps.style, { fontFamily: 'Baloo2_400Regular' }];
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider {...ClerkConfig}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <AuthProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </AuthProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = {} as const;
