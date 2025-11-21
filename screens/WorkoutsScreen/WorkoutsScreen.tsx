import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

export const WorkoutsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workouts Screen</Text>
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
