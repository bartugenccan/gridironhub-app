import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useAppNavigation } from '@/hooks';
import { AppRoutes } from '@/types';

export const Welcome = () => {
  const navigation = useAppNavigation();
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
            title="I am a Player"
            onPress={() => { }}
            size="medium"
            variant="primary"
            style={{ width: 300 }}
          />
          <CustomButton
            title="I am a Coach"
            onPress={() => { }}
            size="medium"
            variant="lightGray"
            style={{ marginTop: 10, width: 300 }}
          />
        </View>
      </View>
      <TouchableOpacity style={{ alignItems: 'center', marginBottom: 20 }} onPress={() => navigation.navigate(AppRoutes.LOGIN)}>
        <Text style={{ color: '#fff' }}>
          Already have an account?{' '}
          <Text style={{ fontWeight: 'bold', color: '#135bed' }}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sectionBackground,
  },
  headerContainer: {
    flex: 0.5,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subHeaderContainer: {
    flex: 0.7,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subHeaderText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
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
