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
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DarkColors } from '@/constants/Colors';
import { authService } from '@/api/services/auth.service';
import * as Linking from 'expo-linking';
import { AppRoutes } from '@/types/navigation';
import { AuthStackParamList } from '@/types/navigation/stacks';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

export const ResetPasswordScreen = () => {
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
    const route = useRoute<any>();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check params from React Navigation
        if (route.params?.access_token) {
            setAccessToken(route.params.access_token);
            return;
        }

        // Fallback: Parse initial URL if params are missing (handling hash fragments)
        const checkInitialUrl = async () => {
            const url = await Linking.getInitialURL();
            if (url) {
                parseUrl(url);
            }
        };
        checkInitialUrl();

    }, [route.params]);

    const parseUrl = (url: string) => {
        // Handle hash fragments manually if needed
        // gridironhub://reset-password#access_token=...&refresh_token=...
        if (url.includes('#')) {
            const hash = url.split('#')[1];
            const params = new URLSearchParams(hash);
            const token = params.get('access_token');
            if (token) setAccessToken(token);
        }
        // Handle query params
        if (url.includes('?')) {
            const query = url.split('?')[1];
            const params = new URLSearchParams(query);
            const token = params.get('access_token');
            if (token) setAccessToken(token);
        }
    };


    const handleReset = async () => {
        if (!accessToken) {
            Alert.alert('Error', 'Invalid reset link. Token missing.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword({
                accessToken,
                newPassword
            });
            Alert.alert(
                'Success',
                'Your password has been reset successfully.',
                [{
                    text: 'Login',
                    onPress: () => navigation.navigate(AppRoutes.LOGIN)
                }]
            );
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message || error?.message || 'Failed to reset password.';
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
                            <View style={styles.header}>
                                <Text style={styles.title}>Reset Password</Text>
                                <Text style={styles.subtitle}>Enter your new password</Text>
                            </View>

                            <View style={styles.inputContainer}>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>New Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            placeholder="New Password"
                                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                            secureTextEntry={!showPassword}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            style={styles.passwordInput}
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
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            placeholder="Confirm Password"
                                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                            secureTextEntry={!showPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            style={styles.passwordInput}
                                            editable={!isLoading}
                                        />
                                    </View>
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
                                        <Text style={styles.buttonText}>Reset Password</Text>
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
