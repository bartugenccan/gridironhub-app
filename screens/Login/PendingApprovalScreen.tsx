import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AppRoutes, AuthStackParamList } from '@/types/navigation';
import { DarkColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = StackNavigationProp<AuthStackParamList, AppRoutes.PENDING_APPROVAL>;

export const PendingApprovalScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleBackToLogin = () => {
        navigation.navigate(AppRoutes.LOGIN);
    };

    return (
        <ImageBackground
            source={require('@/assets/images/login.png')}
            style={styles.backgroundImage}
            resizeMode="cover">
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.contentContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="time-outline" size={80} color={DarkColors.primary} />
                        </View>

                        <Text style={styles.title}>Approval Pending</Text>

                        <Text style={styles.description}>
                            Your account has been created and is awaiting approval.
                            {'\n\n'}
                            Please check your email for updates. Once approved, you will receive instructions to set your password.
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleBackToLogin}
                        >
                            <Text style={styles.buttonText}>Back to Login</Text>
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
    contentContainer: {
        width: '90%',
        padding: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: DarkColors.primary,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
