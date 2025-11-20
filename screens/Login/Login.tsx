import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-gesture-handler';
import { UserRole } from '@/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { loginSchema } from '@/validations/auth.schema';
import { getFieldErrors } from '@/utils/validation';
import { z } from 'zod';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { login, isLoading } = useAuth();

    const handleLogin = async ({ role }: { role: UserRole }) => {
        // Reset errors
        setErrors({});

        // Validate with Zod
        const result = loginSchema.safeParse({
            email,
            password,
            role
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
            const errorMessage = error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
            Alert.alert('Login Error', errorMessage);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="gray"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            // Clear email error when user types
                            if (errors.email) {
                                setErrors(prev => ({ ...prev, email: '' }));
                            }
                        }}
                        style={[styles.input, errors.email && styles.inputError]}
                        editable={!isLoading}
                    />
                    {errors.email && (
                        <Text style={styles.fieldErrorText}>{errors.email}</Text>
                    )}
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor="gray"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            // Clear password error when user types
                            if (errors.password) {
                                setErrors(prev => ({ ...prev, password: '' }));
                            }
                        }}
                        style={[styles.input, errors.password && styles.inputError]}
                        editable={!isLoading}
                    />
                    {errors.password && (
                        <Text style={styles.fieldErrorText}>{errors.password}</Text>
                    )}
                </View>

                {errors.role && (
                    <Text style={styles.errorText}>{errors.role}</Text>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={() => handleLogin({ role: 'coach' })}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Coach Login</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={() => handleLogin({ role: 'player' })}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Player Login</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.darkGray,
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
    input: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        backgroundColor: 'white',
        fontSize: 16,
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
        backgroundColor: '#135bed',
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
});
