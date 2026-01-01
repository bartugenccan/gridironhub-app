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
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
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
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { preloadAssets } from './utils/preloadAssets';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(() => null);

const ThemedStatusBar = () => {
  const { theme } = useTheme();
  return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    BebasNeue_400Regular,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  // Preload assets with safety timeout
  useEffect(() => {
    let isMounted = true;
    const SAFETY_TIMEOUT = 7000; // 7 seconds safety timeout

    const timeoutId = setTimeout(() => {
      if (isMounted && !assetsLoaded) {
        console.warn('⚠️ Safety timeout reached: Forcing assetsLoaded to true');
        setAssetsLoaded(true);
      }
    }, SAFETY_TIMEOUT);

    preloadAssets()
      .then(() => {
        if (isMounted) {
          console.log('📦 Assets loaded status set to true');
          setAssetsLoaded(true);
        }
      })
      .catch((err) => {
        console.error('❌ Error in preloadAssets:', err);
        if (isMounted) setAssetsLoaded(true); // Still proceed
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const hideSplash = async () => {
      try {
        if ((fontsLoaded || fontError) && assetsLoaded) {
          console.log('🚀 Hiding splash screen...');
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('⚠️ Failed to hide splash screen:', e);
      }
    };
    hideSplash();
  }, [fontsLoaded, fontError, assetsLoaded]);

  const onLayoutRootView = useCallback(async () => {
    try {
      if ((fontsLoaded || fontError) && assetsLoaded) {
        console.log('📐 Layout settled, hiding splash screen...');
        await SplashScreen.hideAsync();
      }
    } catch (e) {
      console.warn('⚠️ Failed to hide splash screen on layout:', e);
    }
  }, [fontsLoaded, fontError, assetsLoaded]);


  if (!fontsLoaded || !assetsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <ThemedStatusBar />
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
