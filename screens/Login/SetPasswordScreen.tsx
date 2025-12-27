import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ImageBackground,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppRoutes, AuthStackParamList } from '@/types/navigation';
import { DarkColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
// import { authService } from '@/api/services/auth.service'; // Assuming this will exist

type NavigationProp = StackNavigationProp<AuthStackParamList, AppRoutes.SET_PASSWORD>;

export const SetPasswordScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSetPassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        try {
            setLoading(true);
            // await authService.setPassword(password, token); // This would be the actual call
            // For now, simulate success
            setTimeout(() => {
                Alert.alert('Success', 'Password set successfully', [
                    { text: 'OK', onPress: () => navigation.navigate(AppRoutes.LOGIN) }
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to set password');
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require('@/assets/images/login.png')}
            style={styles.backgroundImage}
            resizeMode="cover">
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Set Password</Text>
                        <Text style={styles.subtitle}>Create a secure password for your account</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    placeholder="Enter new password"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.passwordInput}
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
                                    placeholder="Confirm new password"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={styles.passwordInput}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading && styles.buttonDisabled,
                            ]}
                            onPress={handleSetPassword}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>Set Password</Text>
                            )}
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
    },
    header: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
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
    buttonContainer: {
        width: '100%',
        padding: 20,
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: DarkColors.primary,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
