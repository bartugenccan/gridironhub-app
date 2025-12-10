import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { scale, verticalScale } from 'react-native-size-matters';
import { useTheme } from '@/contexts/ThemeContext';
import { useGetWorkouts } from '@/hooks';
import { Workout } from '@/api/types/workouts';
import { AppRoutes } from '@/types/navigation';
import { useAppNavigation } from '@/hooks';

const CalendarDay = ({
  day,
  date,
  isSelected,
  hasWorkouts,
  isPast,
  onPress,
  colors,
}: {
  day: number | null;
  date: Date;
  isSelected: boolean;
  hasWorkouts: boolean;
  isPast: boolean;
  onPress: () => void;
  colors: typeof import('@/constants/Colors').LightColors;
}) => {
  const styles = getStyles(colors);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear() &&
    day !== null;

  return (
    <TouchableOpacity
      style={[
        styles.calendarDay,
        isPast && !isToday && !isSelected && styles.calendarDayPast,
        isSelected && styles.calendarDaySelected,
        isToday && !isSelected && styles.calendarDayToday,
      ]}
      onPress={onPress}
      disabled={day === null}>
      {day !== null && (
        <>
          <CustomText
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
              isToday && !isSelected && { color: colors.primary },
            ]}>
            {day}
          </CustomText>
          {hasWorkouts && (
            <View
              style={[
                styles.calendarDot,
                (isSelected || isPast) && styles.calendarDotSelected, // White dot if selected or past (dark bg)
                hasWorkouts && !isSelected && !isPast && styles.calendarDotActive, // Primary color dot if active/future
              ]}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const WorkoutItem = ({
  workout,
  colors,
  onPress,
}: {
  workout: Workout;
  colors: typeof import('@/constants/Colors').LightColors;
  onPress: () => void;
}) => {
  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.workoutItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.workoutItemIcon}>
        <MaterialCommunityIcons name="dumbbell" size={20} color={colors.primary} />
      </View>
      <View style={styles.workoutItemContent}>
        <CustomText style={styles.workoutItemName}>{workout.name}</CustomText>
        <View style={styles.workoutItemMeta}>
          <View style={styles.workoutItemMetaItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
            <CustomText style={styles.workoutItemMetaText}>
              {workout.durationMinutes} min
            </CustomText>
          </View>
          {workout.assignedToPositions && workout.assignedToPositions.length > 0 && (
            <View style={styles.workoutItemMetaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <CustomText style={styles.workoutItemMetaText}>
                {workout.assignedToPositions.join(', ')}
              </CustomText>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

export const ScheduleScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useAppNavigation();
  const { data: workouts, isLoading } = useGetWorkouts();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Get all workouts
  const allWorkouts = useMemo(() => {
    if (!workouts) return [];
    return [...workouts.teamWorkouts, ...workouts.positionWorkouts];
  }, [workouts]);

  // Helper to format date key as YYYY-MM-DD in LOCAL time
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get workouts for selected date
  const selectedDateWorkouts = useMemo(() => {
    const dateKey = formatDateKey(selectedDate);
    return allWorkouts.filter((w) => w.scheduledDate === dateKey);
  }, [allWorkouts, selectedDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentMonth]);

  // Check if a date has workouts
  const dateHasWorkouts = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateKey = formatDateKey(date);
    return allWorkouts.some((w) => w.scheduledDate === dateKey);
  };

  const handleDayPress = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleWorkoutPress = (workout: Workout) => {
    navigation.navigate(AppRoutes.WORKOUTS_DETAIL, { workoutId: workout.id });
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateFormatted = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>Schedule</CustomText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthNavButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <CustomText style={styles.monthTitle}>{monthName}</CustomText>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <View key={day} style={styles.weekday}>
                  <CustomText style={styles.weekdayText}>{day}</CustomText>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <View key={index} style={styles.calendarDay} />;
                }

                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);

                const isSelected = compareDate.getTime() === new Date(selectedDate.setHours(0, 0, 0, 0)).getTime();
                const isPast = compareDate.getTime() < today.getTime();
                const hasWorkouts = dateHasWorkouts(day);

                return (
                  <CalendarDay
                    key={index}
                    day={day}
                    date={date}
                    isSelected={isSelected}
                    hasWorkouts={hasWorkouts}
                    isPast={isPast}
                    onPress={() => handleDayPress(day)}
                    colors={colors}
                  />
                );
              })}
            </View>
          </View>

          {/* Selected Date Workouts */}
          <View style={styles.workoutsSection}>
            <CustomText style={styles.sectionTitle}>{selectedDateFormatted}</CustomText>
            {selectedDateWorkouts.length > 0 ? (
              <View style={styles.workoutsList}>
                {selectedDateWorkouts.map((workout) => (
                  <WorkoutItem
                    key={workout.id}
                    workout={workout}
                    colors={colors}
                    onPress={() => handleWorkoutPress(workout)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                <CustomText style={styles.emptyText}>
                  No workouts scheduled for this date
                </CustomText>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    header: {
      paddingHorizontal: scale(20),
      paddingVertical: verticalScale(16),
      backgroundColor: colors.playerCardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: scale(24),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
    calendarContainer: {
      backgroundColor: colors.playerCardBackground,
      margin: scale(16),
      borderRadius: scale(16),
      padding: scale(8),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(16),
    },
    monthNavButton: {
      padding: scale(8),
    },
    monthTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    weekdayHeader: {
      flexDirection: 'row',
      marginBottom: verticalScale(8),
    },
    weekday: {
      flex: 1,
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.textSecondary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      paddingBottom: verticalScale(6),
    },
    calendarDayPast: {
      opacity: 0.5,
    },
    calendarDayToday: {
      backgroundColor: colors.primaryLight + '20',
      borderRadius: scale(8),
    },
    calendarDaySelected: {
      backgroundColor: colors.primary,
      borderRadius: scale(8),
    },
    calendarDayText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.text,
    },
    calendarDayTextSelected: {
      color: '#fff',
      fontFamily: Typography.fontFamily.bold,
    },
    calendarDot: {
      position: 'absolute',
      bottom: scale(-4),
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
    },
    calendarDotSelected: {
      backgroundColor: '#fff',
    },
    calendarDotActive: {
      backgroundColor: colors.primary,
    },
    workoutsSection: {
      padding: scale(16),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(16),
    },
    workoutsList: {
      gap: scale(12),
    },
    workoutItem: {
      backgroundColor: colors.playerCardBackground,
      borderRadius: scale(12),
      padding: scale(16),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    workoutItemIcon: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: colors.recordIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(12),
    },
    workoutItemContent: {
      flex: 1,
    },
    workoutItemName: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      marginBottom: verticalScale(4),
    },
    workoutItemMeta: {
      flexDirection: 'row',
      gap: scale(12),
      flexWrap: 'wrap',
    },
    workoutItemMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
    },
    workoutItemMetaText: {
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(40),
    },
    emptyText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      marginTop: verticalScale(12),
      textAlign: 'center',
    },
  });
