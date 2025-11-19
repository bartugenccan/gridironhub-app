import { StyleSheet, View, Text, Touchable, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAppNavigation } from '@/hooks';
import { AppRoutes } from '@/types/navigation/routes';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeDetail = () => {
  const navigation = useAppNavigation();
  return (
    <SafeAreaView>
      <Text>HomeDetail</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(AppRoutes.WELCOME);
        }}>
        <Text>Navigate to Welcome Screen</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});
