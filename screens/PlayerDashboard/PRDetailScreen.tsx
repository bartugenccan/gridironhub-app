import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CustomText } from '@/components';
import { scale, verticalScale } from 'react-native-size-matters';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AppRoutes } from '@/types/navigation/routes';
import { DashboardStackParamList } from '@/types/navigation/stacks';
import { statsService, PersonalRecord } from '@/api/services/stats.service';
import { LineChart } from 'react-native-chart-kit';
import { formatDate } from '@/utils/formatDate';

type PRDetailScreenRouteProp = RouteProp<DashboardStackParamList, typeof AppRoutes.PR_DETAIL>;

export const PRDetailScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const route = useRoute<PRDetailScreenRouteProp>();
    const { liftName } = route.params;

    const [history, setHistory] = useState<PersonalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newMax, setNewMax] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [liftName]);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const data = await statsService.getPersonalRecordHistory(liftName);
            // Sort by date ascending for chart
            const sortedData = data.sort(
                (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
            );
            setHistory(sortedData);
        } catch (error) {
            console.error('Error fetching history:', error);
            Alert.alert('Error', 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!newMax) {
            Alert.alert('Error', 'Please enter a new max weight');
            return;
        }

        try {
            setIsSubmitting(true);
            await statsService.updatePersonalRecord({
                liftName,
                oneRepMax: parseFloat(newMax),
                notes: notes || undefined,
            });

            Alert.alert('Success', 'Personal record updated!', [
                {
                    text: 'OK', onPress: () => {
                        setNewMax('');
                        setNotes('');
                        fetchHistory(); // Refresh chart
                    }
                }
            ]);
        } catch (error) {
            console.error('Error updating PR:', error);
            Alert.alert('Error', 'Failed to update personal record');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getChartData = () => {
        if (history.length === 0) return null;

        // Take last 6 records for better visibility if list is long
        const recentHistory = history.slice(-6);

        return {
            labels: recentHistory.map((record) => {
                const date = new Date(record.recordedAt);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }),
            datasets: [
                {
                    data: recentHistory.map((record) => record.oneRepMax),
                    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // Primary blue
                    strokeWidth: 2,
                },
            ],
            legend: [`${liftName} Progress`],
        };
    };

    const chartConfig = {
        backgroundGradientFrom: colors.playerCardBackground,
        backgroundGradientTo: colors.playerCardBackground,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#2563EB',
        },
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>{liftName} Progress</CustomText>
                <View style={{ width: scale(24) }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {/* Chart Section */}
                        <View style={styles.chartContainer}>
                            {history.length > 0 ? (
                                <LineChart
                                    data={getChartData()!}
                                    width={Dimensions.get('window').width - scale(40)}
                                    height={verticalScale(220)}
                                    chartConfig={chartConfig}
                                    bezier
                                    style={styles.chart}
                                />
                            ) : (
                                <View style={styles.noDataContainer}>
                                    <CustomText style={styles.noDataText}>No history available yet</CustomText>
                                </View>
                            )}
                        </View>

                        {/* Update Form Section */}
                        <View style={styles.formContainer}>
                            <CustomText style={styles.sectionTitle}>Update Record</CustomText>

                            <View style={styles.inputGroup}>
                                <CustomText style={styles.label}>New 1 Rep Max (kg)</CustomText>
                                <TextInput
                                    style={styles.input}
                                    value={newMax}
                                    onChangeText={setNewMax}
                                    placeholder="e.g. 225"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <CustomText style={styles.label}>Notes (Optional)</CustomText>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="How did it feel?"
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.updateButton, isSubmitting && styles.disabledButton]}
                                onPress={handleUpdate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <CustomText style={styles.updateButtonText}>Update PR</CustomText>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* History List */}
                        <View style={styles.historyContainer}>
                            <CustomText style={styles.sectionTitle}>History</CustomText>
                            {history.slice().reverse().map((record, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <View style={styles.historyLeft}>
                                        <CustomText style={styles.historyWeight}>{record.oneRepMax} kg</CustomText>
                                        <CustomText style={styles.historyDate}>{formatDate(record.recordedAt)}</CustomText>
                                    </View>
                                    {index === 0 && (
                                        <View style={styles.currentBadge}>
                                            <CustomText style={styles.currentBadgeText}>Current</CustomText>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.playerDashboardBackground,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: verticalScale(50),
        paddingBottom: verticalScale(15),
        paddingHorizontal: scale(20),
        backgroundColor: colors.playerCardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    backButton: {
        padding: scale(5),
    },
    headerTitle: {
        fontSize: scale(18),
        fontFamily: Typography.fontFamily.bold,
        color: colors.text,
    },
    scrollContent: {
        paddingBottom: verticalScale(40),
    },
    chartContainer: {
        alignItems: 'center',
        marginVertical: verticalScale(20),
        paddingHorizontal: scale(20),
    },
    chart: {
        borderRadius: 16,
    },
    noDataContainer: {
        height: verticalScale(200),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.playerCardBackground,
        borderRadius: 16,
        width: '100%',
    },
    noDataText: {
        color: colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
    },
    formContainer: {
        backgroundColor: colors.playerCardBackground,
        marginHorizontal: scale(20),
        padding: scale(20),
        borderRadius: 16,
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    sectionTitle: {
        fontSize: scale(16),
        fontFamily: Typography.fontFamily.bold,
        color: colors.text,
        marginBottom: verticalScale(15),
    },
    inputGroup: {
        marginBottom: verticalScale(15),
    },
    label: {
        fontSize: scale(14),
        color: colors.textSecondary,
        marginBottom: verticalScale(8),
        fontFamily: Typography.fontFamily.regular,
    },
    input: {
        backgroundColor: colors.playerDashboardBackground,
        borderRadius: 8,
        padding: scale(12),
        color: colors.text,
        fontFamily: Typography.fontFamily.regular,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    textArea: {
        height: verticalScale(80),
        textAlignVertical: 'top',
    },
    updateButton: {
        backgroundColor: '#2563EB',
        padding: scale(15),
        borderRadius: 8,
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    disabledButton: {
        opacity: 0.7,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: scale(16),
        fontFamily: Typography.fontFamily.bold,
    },
    historyContainer: {
        paddingHorizontal: scale(20),
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.playerCardBackground,
        padding: scale(15),
        borderRadius: 12,
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    historyLeft: {
        flex: 1,
    },
    historyWeight: {
        fontSize: scale(16),
        fontFamily: Typography.fontFamily.bold,
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    historyDate: {
        fontSize: scale(12),
        color: colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
    },
    currentBadge: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: 12,
    },
    currentBadgeText: {
        color: '#2563EB',
        fontSize: scale(12),
        fontFamily: Typography.fontFamily.semiBold,
    },
});
