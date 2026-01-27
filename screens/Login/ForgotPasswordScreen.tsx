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
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DarkColors } from '@/constants/Colors';
import { z } from 'zod';
import * as Linking from 'expo-linking';
import { authService } from '@/api/services/auth.service';
import { forgotPasswordSchema } from '@/validations/auth.schema';
import { getFieldErrors } from '@/utils/validation';

export const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleReset = async () => {
        setErrors({});

        const result = forgotPasswordSchema.safeParse({ email });

        if (!result.success) {
            const fieldErrors = getFieldErrors(result.error);
            setErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            Alert.alert(
                'Check your email',
                'We sent you a link to reset your password.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || 'Failed to send reset link.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
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
                    >
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>

                            <View style={styles.header}>
                                <Text style={styles.title}>Forgot Password</Text>
                                <Text style={styles.subtitle}>Enter your email to reset password</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        placeholder="Enter your email"
                                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            if (errors.email) setErrors({ ...errors, email: '' });
                                        }}
                                        style={[styles.input, errors.email && styles.inputError]}
                                        editable={!isLoading}
                                    />
                                    {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        isLoading && styles.buttonDisabled,
                                        { backgroundColor: DarkColors.primaryDark },
                                    ]}
                                    onPress={handleReset}
                                    disabled={isLoading}>
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send Reset Link</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
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
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        padding: 10,
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
        color: 'white',
    },
    inputContainer: {
        width: '100%',
        padding: 20,
        rowGap: 20,
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
});
