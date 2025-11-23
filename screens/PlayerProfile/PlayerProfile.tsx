import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { usePlayerProfile } from '@/hooks/usePlayer';
import { RosterStackParamList } from '@/types/navigation/stacks';
import { AppRoutes } from '@/types/navigation/routes';
import { scale, verticalScale } from 'react-native-size-matters';

type PlayerProfileRouteProp = RouteProp<RosterStackParamList, AppRoutes.PLAYER_PROFILE>;

export const PlayerProfile = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const route = useRoute<PlayerProfileRouteProp>();
    const { playerId } = route.params;

    const { data: player, isLoading, error } = usePlayerProfile(playerId);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading player profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !player) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={scale(48)} color={colors.error} />
                    <Text style={styles.errorText}>
                        {error?.message || 'Failed to load player profile'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const prEntries = [
        { key: 'benchPress', label: 'Bench Press', icon: 'minus', unit: 'kg' },
        { key: 'squat', label: 'Squat', icon: 'dumbbell', unit: 'kg' },
        { key: 'deadlift', label: 'Deadlift', icon: 'weight-lifter', unit: 'kg' },
        { key: 'overheadPress', label: 'Overhead Press', icon: 'arm-flex', unit: 'kg' },
        { key: 'clean', label: 'Clean', icon: 'dumbbell', unit: 'kg' },
        { key: 'fortyYardDash', label: '40 Yard Dash', icon: 'run-fast', unit: 's' },
    ] as const;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        {player.jerseyNumber && (
                            <Text style={styles.jerseyNumber}>#{player.jerseyNumber}</Text>
                        )}
                        <Text style={styles.playerName}>{player.fullName}</Text>
                        {player.position && <Text style={styles.position}>{player.position}</Text>}
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Physical Stats</Text>
                    <View style={styles.statsGrid}>
                        {player.heightCm && (
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Height</Text>
                                <Text style={styles.statValue}>{player.heightCm} cm</Text>
                            </View>
                        )}
                        {player.weightKg && (
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Weight</Text>
                                <Text style={styles.statValue}>{player.weightKg} kg</Text>
                            </View>
                        )}
                        {player.dominantHand && (
                            <View style={styles.statCard}>
                                <Text style={styles.statLabel}>Dominant Hand</Text>
                                <Text style={styles.statValue}>
                                    {player.dominantHand.charAt(0).toUpperCase() + player.dominantHand.slice(1)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bio Section */}
                {player.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bio</Text>
                        <Text style={styles.bioText}>{player.bio}</Text>
                    </View>
                )}

                {/* Personal Records Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Records</Text>
                    <View style={styles.prGrid}>
                        {prEntries.map(({ key, label, icon, unit }) => {
                            const prValue = player.prs[key];
                            return (
                                <View key={key} style={styles.prCard}>
                                    <View style={styles.prIconContainer}>
                                        <MaterialCommunityIcons
                                            name={icon as any}
                                            size={scale(24)}
                                            color={prValue ? colors.primary : colors.textMuted}
                                        />
                                    </View>
                                    <View style={styles.prContent}>
                                        <Text style={styles.prLabel}>{label}</Text>
                                        {prValue ? (
                                            <>
                                                <Text style={styles.prValue}>
                                                    {prValue.value} {unit}
                                                </Text>
                                                <Text style={styles.prDate}>
                                                    {new Date(prValue.recordedAt).toLocaleDateString()}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text style={styles.prNoData}>No record</Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.playerDashboardBackground,
        },
        scrollView: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: verticalScale(16),
            fontSize: scale(14),
            color: colors.textSecondary,
            fontFamily: Typography.fontFamily.regular,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: scale(32),
        },
        errorText: {
            marginTop: verticalScale(16),
            fontSize: scale(14),
            color: colors.error,
            fontFamily: Typography.fontFamily.regular,
            textAlign: 'center',
        },
        header: {
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(24),
            backgroundColor: colors.cardBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
        },
        headerInfo: {
            alignItems: 'center',
        },
        jerseyNumber: {
            fontSize: scale(48),
            fontFamily: Typography.fontFamily.bold,
            color: colors.primary,
            marginBottom: verticalScale(8),
        },
        playerName: {
            fontSize: scale(24),
            fontFamily: Typography.fontFamily.bold,
            color: colors.text,
            marginBottom: verticalScale(4),
        },
        position: {
            fontSize: scale(16),
            fontFamily: Typography.fontFamily.semiBold,
            color: colors.textSecondary,
        },
        section: {
            paddingHorizontal: scale(20),
            paddingVertical: verticalScale(20),
        },
        sectionTitle: {
            fontSize: scale(18),
            fontFamily: Typography.fontFamily.bold,
            color: colors.text,
            marginBottom: verticalScale(16),
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: scale(12),
        },
        statCard: {
            flex: 1,
            minWidth: '30%',
            backgroundColor: colors.cardBackground,
            padding: scale(16),
            borderRadius: scale(12),
            borderWidth: 1,
            borderColor: colors.borderLight,
        },
        statLabel: {
            fontSize: scale(12),
            fontFamily: Typography.fontFamily.regular,
            color: colors.textSecondary,
            marginBottom: verticalScale(4),
        },
        statValue: {
            fontSize: scale(16),
            fontFamily: Typography.fontFamily.bold,
            color: colors.text,
        },
        bioText: {
            fontSize: scale(14),
            fontFamily: Typography.fontFamily.regular,
            color: colors.text,
            lineHeight: scale(20),
        },
        prGrid: {
            gap: scale(12),
        },
        prCard: {
            backgroundColor: colors.cardBackground,
            padding: scale(16),
            borderRadius: scale(12),
            borderWidth: 1,
            borderColor: colors.borderLight,
            flexDirection: 'row',
            alignItems: 'center',
        },
        prIconContainer: {
            width: scale(48),
            height: scale(48),
            borderRadius: scale(24),
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: scale(16),
        },
        prContent: {
            flex: 1,
        },
        prLabel: {
            fontSize: scale(14),
            fontFamily: Typography.fontFamily.semiBold,
            color: colors.text,
            marginBottom: verticalScale(4),
        },
        prValue: {
            fontSize: scale(18),
            fontFamily: Typography.fontFamily.bold,
            color: colors.primary,
        },
        prDate: {
            fontSize: scale(12),
            fontFamily: Typography.fontFamily.regular,
            color: colors.textSecondary,
            marginTop: verticalScale(2),
        },
        prNoData: {
            fontSize: scale(14),
            fontFamily: Typography.fontFamily.regular,
            color: colors.textMuted,
        },
    });
