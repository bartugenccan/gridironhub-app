import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useAppNavigation } from '@/hooks';
import { AppRoutes } from '@/types/navigation/routes';

export const TeamScreen = () => {
  const navigation = useAppNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Team Screen</Text>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(AppRoutes.LOGIN);
        }}>
        <Text>Navigate to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
  },
});
