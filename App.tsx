import 'react-native-gesture-handler';

import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './navigation/AppNavigator';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// i18n
import './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { preloadAssets } from './utils/preloadAssets';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  // Preload assets
  useEffect(() => {
    preloadAssets().then(() => setAssetsLoaded(true));
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      if ((fontsLoaded || fontError) && assetsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [fontsLoaded, fontError, assetsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && assetsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, assetsLoaded]);

  if (!fontsLoaded || !assetsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <AuthProvider>
                <AppNavigator />
              </AuthProvider>
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
