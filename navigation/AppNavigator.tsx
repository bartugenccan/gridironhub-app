import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { AppRoutes, RootStackParamList } from '@/types/navigation';
import { useMemo, useState, useCallback } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingAnimation } from '@/components';

// Enable native screens optimization
enableScreens();

const RootStack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      cardStyleInterpolator: Platform.select({
        ios: CardStyleInterpolators.forHorizontalIOS,
        android: CardStyleInterpolators.forFadeFromBottomAndroid,
      }),
      detachInactiveScreens: true,
      freezeOnBlur: true,
      lazy: true,
      unmountOnBlur: true,
    }),
    []
  );

  const renderScreens = useCallback(() => {
    if (isAuthenticated) {
      return <RootStack.Screen name={AppRoutes.MAIN} component={MainNavigator} />;
    }
    return <RootStack.Screen name={AppRoutes.AUTH} component={AuthNavigator} />;
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingAnimation />
      </View>
    );
  }

  return <RootStack.Navigator screenOptions={screenOptions}>{renderScreens()}</RootStack.Navigator>;
};
