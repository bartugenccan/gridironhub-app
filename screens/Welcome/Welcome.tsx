import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import CustomButton from '../../components/CustomButton/CustomButton';
import { useAppNavigation } from '@/hooks';
import { AppRoutes } from '@/types';
import { BlurView } from 'expo-blur';
import { scale } from 'react-native-size-matters';

export const Welcome = () => {
  const navigation = useAppNavigation();
  return (
    <ImageBackground
      source={require('assets/images/welcome.png')}
      style={styles.backgroundContainer}
      resizeMode="cover">
      <BlurView intensity={30} tint="dark" style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Gridiron Hub</Text>
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
          <TouchableOpacity
            style={{ alignItems: 'center' }}
            onPress={() => navigation.navigate(AppRoutes.LOGIN)}>
            <Text style={{ color: '#fff' }}>
              Already have an account?{' '}
              <Text style={{ fontWeight: 'bold', color: '#135bed' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    flex: 2
  },
  headerText: {
    color: '#fff',
    fontSize: scale(32),
    fontWeight: 'bold',
  },
  subHeaderContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: scale(30),
    paddingHorizontal: scale(20),
  },
  subHeaderText: {
    color: '#fff',
    fontSize: scale(34),
    fontWeight: 'bold',
  },
  subText: {
    color: '#fff',
    fontSize: scale(16),
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: scale(20),
  },
});
