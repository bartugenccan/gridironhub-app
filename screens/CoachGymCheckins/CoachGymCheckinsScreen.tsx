import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { CustomText } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import { useAllCheckins } from '@/hooks/useGym';
import { scale, verticalScale } from 'react-native-size-matters';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { GymCheckin } from '@/api/types/gym';
import { formatDate } from '@/utils/formatDate';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

export const CoachGymCheckinsScreen = () => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const { data: checkinsData, isLoading, error, refetch } = useAllCheckins();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            setSelectedDate(date);
        }
    };

    const clearFilter = () => {
        setSelectedDate(null);
    };

    const filteredCheckins = useMemo(() => {
        if (!checkinsData?.checkins) return [];

        let checkins = [...checkinsData.checkins];

        if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            checkins = checkins.filter(c => c.checkinDate === dateString);
        }

        return checkins;
    }, [checkinsData, selectedDate]);

    const groupedCheckins = useMemo(() => {
        if (filteredCheckins.length === 0) return [];

        // Group by date
        const groups: { date: string; data: GymCheckin[] }[] = [];
        filteredCheckins.forEach((checkin) => {
            const date = checkin.checkinDate;
            const existingGroup = groups.find((g) => g.date === date);
            if (existingGroup) {
                existingGroup.data.push(checkin);
            } else {
                groups.push({ date, data: [checkin] });
            }
        });

        // Sort groups by date descending
        return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredCheckins]);

    const renderCheckinItem = ({ item }: { item: GymCheckin }) => {
        return (
            <View style={styles.checkinCard}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="check-circle-outline" size={scale(24)} color={colors.success} />
                </View>
                <View style={styles.contentContainer}>
                    <CustomText style={styles.playerName}>{item.playerName || 'Unknown Player'}</CustomText>
                    <CustomText style={styles.timestamp}>Checked in at: {formatDate(item.createdAt)}</CustomText>
                </View>
            </View>
        );
    };

    const renderGroup = ({ item }: { item: { date: string; data: GymCheckin[] } }) => (
        <View style={styles.groupContainer}>
            <View style={styles.groupHeader}>
                <CustomText style={styles.groupDate}>{formatDate(item.date)}</CustomText>
                <View style={styles.countBadge}>
                    <CustomText style={styles.countText}>{item.data.length}</CustomText>
                </View>
            </View>
            <FlatList
                data={item.data}
                renderItem={renderCheckinItem}
                keyExtractor={(checkin) => checkin.id}
                scrollEnabled={false}
            />
        </View>
    );

    const handleRefresh = () => {
        refetch();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={scale(24)} color={colors.text} />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Gym Check-ins</CustomText>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.filterButton}>
                    <Ionicons name="filter" size={scale(20)} color={selectedDate ? colors.primary : colors.text} />
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {selectedDate && (
                <View style={styles.filterBanner}>
                    <CustomText style={styles.filterText}>
                        Showing: {selectedDate.toLocaleDateString()}
                    </CustomText>
                    <TouchableOpacity onPress={clearFilter}>
                        <Ionicons name="close-circle" size={scale(20)} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={scale(40)} color={colors.error} />
                    <CustomText style={styles.errorText}>Failed to load check-ins</CustomText>
                </View>
            ) : (
                <FlatList
                    data={groupedCheckins}
                    renderItem={renderGroup}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <CustomText style={styles.emptyText}>No check-ins found</CustomText>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(50),
        paddingBottom: verticalScale(15),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background, // Ensure header has background
    },
    backButton: {
        padding: scale(4),
    },
    headerTitle: {
        fontSize: scale(20),
        fontFamily: Typography.fontFamily.bold,
        color: colors.text,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    listContent: {
        padding: scale(20),
    },
    groupContainer: {
        marginBottom: verticalScale(20),
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
        paddingHorizontal: scale(4),
    },
    groupDate: {
        fontSize: scale(16),
        fontFamily: Typography.fontFamily.bold,
        color: colors.text,
    },
    countBadge: {
        backgroundColor: colors.primary + '20', // 20% opacity
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: scale(12),
    },
    countText: {
        color: colors.primary,
        fontSize: scale(12),
        fontFamily: Typography.fontFamily.bold,
    },
    checkinCard: {
        backgroundColor: colors.card,
        borderRadius: scale(12),
        padding: scale(15),
        marginBottom: verticalScale(8),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        marginRight: scale(15),
    },
    contentContainer: {
        flex: 1,
    },
    playerName: {
        fontSize: scale(14),
        fontFamily: Typography.fontFamily.semiBold,
        color: colors.text,
        marginBottom: verticalScale(2),
    },
    timestamp: {
        fontSize: scale(12),
        color: colors.textSecondary,
        fontFamily: Typography.fontFamily.regular,
    },
    errorText: {
        marginTop: verticalScale(10),
        color: colors.textSecondary,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: scale(14),
    },
    filterButton: {
        padding: scale(4),
    },
    filterBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(10),
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterText: {
        fontSize: scale(14),
        fontFamily: Typography.fontFamily.semiBold,
        color: colors.text,
    },
});
