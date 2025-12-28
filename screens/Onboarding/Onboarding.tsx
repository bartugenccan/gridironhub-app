
import React, { useRef } from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomText } from '@/components';
import { Colors } from '@/constants/Colors';
import { scale, verticalScale } from 'react-native-size-matters';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { AppRoutes } from '@/types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/types/navigation/stacks';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'COACH YOUR WAY',
        description: 'Manage your roster, approve PRs, and track team stats all in one place.',
        image: require('assets/images/onboarding1.png'), // Placeholder, need to ensure asset exists or use a generic one
    },
    {
        id: 2,
        title: 'TRACK YOUR PROGRESS',
        description: 'Log your workouts, hit new PRs, and see your growth over time.',
        image: require('assets/images/onboarding2.png'),
    },
    {
        id: 3,
        title: 'JOIN THE COMMUNITY',
        description: 'Connect with your team and elevate your game to the next level.',
        image: require('assets/images/onboarding3.png'),
    },
];

export const Onboarding = () => {
    const { completeOnboarding } = useAuth();
    const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = React.useState(0);

    const handleNext = () => {
        if (currentPage < slides.length - 1) {
            pagerRef.current?.setPage(currentPage + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        await completeOnboarding();
        // Navigation to Welcome is handled by AuthNavigator logic or we can replace explicitly if needed
        // But since `hasSeenOnboarding` updates, the parent navigator *should* react if it was conditional.
        // However, AuthNavigator is a stack. We likely just want to navigate to Welcome.
        navigation.replace(AppRoutes.WELCOME);
    };

    return (
        <View style={styles.container}>
            <PagerView
                style={styles.pagerView}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
                {slides.map((slide, index) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={styles.imageContainer}>
                            <Image source={slide.image} style={styles.image} resizeMode="cover" />
                        </View>

                        <View style={styles.contentContainer}>
                            <CustomText style={styles.title}>{slide.title}</CustomText>
                            <CustomText style={styles.description}>{slide.description}</CustomText>
                        </View>
                    </View>
                ))}
            </PagerView>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentPage === index && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    {currentPage < 2 ? (
                        <TouchableOpacity onPress={() => handleFinish()}>
                            <CustomText style={styles.skipText}>Skip</CustomText>
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNext}
                    >
                        <CustomText style={styles.buttonText}>
                            {currentPage === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    pagerView: {
        flex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 0.6,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 0.4,
        paddingHorizontal: scale(30),
        paddingTop: verticalScale(20),
        alignItems: 'center',
    },
    title: {
        fontSize: scale(36),
        fontFamily: 'BebasNeue_400Regular',
        color: '#fff',
        textAlign: 'center',
        marginBottom: verticalScale(15),
    },
    description: {
        fontSize: scale(16),
        fontFamily: 'Montserrat_400Regular',
        color: '#ccc',
        textAlign: 'center',
        lineHeight: scale(24),
    },
    footer: {
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(40),
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: verticalScale(30),
    },
    dot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: '#333',
        marginHorizontal: scale(4),
    },
    activeDot: {
        backgroundColor: Colors.primary, // Using primary color
        width: scale(20),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipText: {
        color: '#666',
        fontSize: scale(14),
        fontFamily: 'Montserrat_600SemiBold',
        marginLeft: scale(10),
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: scale(30),
        paddingVertical: verticalScale(12),
        borderRadius: scale(25),
    },
    buttonText: {
        color: '#fff',
        fontSize: scale(16),
        fontFamily: 'BebasNeue_400Regular', // Keeping consistent with title
    },
});
