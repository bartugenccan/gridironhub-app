import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingAnimationProps {
    size?: number;
    style?: ViewStyle;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
    size = 100,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            <LottieView
                source={require('@/assets/animations/loading.json')}
                autoPlay
                loop
                style={{ width: size, height: size }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
