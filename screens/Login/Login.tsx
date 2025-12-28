import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { DarkColors } from '@/constants/Colors';
import { loginSchema } from '@/validations/auth.schema';
import { getFieldErrors } from '@/utils/validation';
import { z } from 'zod';
import { useAppNavigation } from '@/hooks';
import { AppRoutes } from '@/types';

export const Login = () => {
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigation = useAppNavigation();

  const { login, isLoading } = useAuth();

  const handleLogin = async ({ role }: { role: UserRole }) => {
    // Reset errors
    setErrors({});

    // Validate with Zod
    const result = loginSchema.safeParse({
      email: emailRef.current,
      password: passwordRef.current,
      role,
    });

    if (!result.success) {
      // Extract field-specific errors
      const fieldErrors = getFieldErrors(result.error);
      setErrors(fieldErrors);

      // Show first error in alert
      const firstError = result.error.issues[0]?.message;
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    try {
      await login(result.data);
      // Navigation will happen automatically via AppNavigator when isAuthenticated becomes true
    } catch (error: any) {
      // Handle Zod validation errors from API service
      if (error instanceof z.ZodError) {
        const fieldErrors = getFieldErrors(error);
        setErrors(fieldErrors);
        Alert.alert('Validation Error', error.issues[0]?.message || 'Invalid data');
        return;
      }

      // Handle API errors
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/login.png')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: '100%' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email or Username</Text>
                  <TextInput
                    placeholder="Enter your email or username"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    // value={email} // Removed controlled value
                    defaultValue={emailRef.current}
                    onChangeText={(text) => {
                      emailRef.current = text;
                      // Clear email error when user types
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    style={[styles.input, errors.email && styles.inputError]}
                    editable={!isLoading}
                  />
                  {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      secureTextEntry={!showPassword}
                      // value={password} // Removed controlled value
                      defaultValue={passwordRef.current}
                      onChangeText={(text) => {
                        passwordRef.current = text;
                        // Clear password error when user types
                        if (errors.password) {
                          setErrors((prev) => ({ ...prev, password: '' }));
                        }
                      }}
                      style={[styles.passwordInput, errors.password && styles.inputError]}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}>
                      <Ionicons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={24}
                        color="rgba(255, 255, 255, 0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.fieldErrorText}>{errors.password}</Text>}
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </TouchableOpacity>

                {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    isLoading && styles.buttonDisabled,
                    { backgroundColor: DarkColors.primaryDark },
                  ]}
                  onPress={() => handleLogin({ role: 'player' })}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Player Login</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={() => handleLogin({ role: 'coach' })}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Coach Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(AppRoutes.SIGN_UP)}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  appHeader: {
    width: '100%',
    paddingBottom: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 80,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DarkColors.white,
    letterSpacing: 1,
  },
  header: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
  },
  inputContainer: {
    width: '100%',
    padding: 20,
    rowGap: 15,
  },
  inputWrapper: {
    width: '100%',
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 16,
    color: 'white',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    width: '100%',
    padding: 15,
    paddingRight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 16,
    color: 'white',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  fieldErrorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 5,
    marginLeft: 5,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    padding: 20,
    rowGap: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: DarkColors.borderLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },

  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signupText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  signupLink: {
    color: DarkColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
