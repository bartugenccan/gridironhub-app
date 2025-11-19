import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import CustomButton from '../../components/CustomButton/CustomButton';

export const Welcome = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>GRIDIRON HUB</Text>
      </View>
      <View style={styles.subHeaderContainer}>
        <Text style={styles.subHeaderText}>Elevate Your Game</Text>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subText}>Choose your role to get started</Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Submit"
            onPress={() => {}}
            size="medium"
            variant="primary"
            style={{ width: 200 }}
          />
          <CustomButton
            title="Submit"
            onPress={() => {}}
            size="medium"
            variant="primary"
            style={{ marginTop: 10, width: 200 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    flex: 0.5,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subHeaderContainer: {
    flex: 0.7,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
  },
  subHeaderText: {
    color: '#fff',
    fontSize: 34,
  },
  subText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
