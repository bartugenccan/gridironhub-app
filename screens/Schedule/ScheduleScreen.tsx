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
import { useCheckInHistory } from '@/hooks/useGym';

const CalendarDay = ({
  day,
  date,
  isSelected,
  hasWorkouts,
  hasCheckIn,
  isPast,
  onPress,
  colors,
}: {
  day: number | null;
  date: Date;
  isSelected: boolean;
  hasWorkouts: boolean;
  hasCheckIn: boolean;
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
          <View style={styles.dotsContainer}>
            {hasWorkouts && (
              <View
                style={[
                  styles.calendarDot,
                  isSelected && styles.calendarDotSelected, // White dot ONLY if selected
                  !isSelected && styles.calendarDotActive, // Primary color dot if not selected (past or future)
                ]}
              />
            )}
            {hasCheckIn && (
              <View
                style={[
                  styles.calendarDot,
                  styles.calendarDotCheckIn,
                ]}
              />
            )}
          </View>
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
  const { data: workouts, isLoading: isLoadingWorkouts } = useGetWorkouts();
  const { data: checkInHistory, isLoading: isLoadingCheckIns, error: checkInError } = useCheckInHistory();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // ... (existing code)

  const isLoading = isLoadingWorkouts || isLoadingCheckIns;

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
    // Use local time for date key to match workout date string
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const dateKey = localDate.toISOString().split('T')[0];

    // Fallback to simple formatting if timezone offset logic is tricky
    // Consistent with formatDateKey above which uses local time components
    const simpleKey = formatDateKey(date);

    return allWorkouts.some((w) => w.scheduledDate === simpleKey);
  };

  // Check if a date has check-in
  const dateHasCheckIn = (day: number): boolean => {
    if (!checkInHistory?.checkins) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateKey = formatDateKey(date);
    // Use startsWith to handle both "YYYY-MM-DD" and "YYYY-MM-DDT..." formats
    return checkInHistory.checkins.some((c) => c.checkinDate.startsWith(dateKey));
  };

  const handleDayPress = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleTodayPress = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };
  // Check if selected date is today
  const isToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }, [selectedDate]);

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

                const isSelected =
                  compareDate.getTime() === new Date(selectedDate.setHours(0, 0, 0, 0)).getTime();
                const isPast = compareDate.getTime() < today.getTime();
                const hasWorkouts = dateHasWorkouts(day);
                const hasCheckIn = dateHasCheckIn(day);

                return (
                  <CalendarDay
                    key={index}
                    day={day}
                    date={date}
                    isSelected={isSelected}
                    hasWorkouts={hasWorkouts}
                    hasCheckIn={hasCheckIn}
                    isPast={isPast}
                    onPress={() => handleDayPress(day)}
                    colors={colors}
                  />
                );
              })}
            </View>
          </View>
          {/* Today Button - Only show if not viewing today */}
          {!isToday && (
            <View style={styles.todayButtonContainer}>
              <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
                <Ionicons name="today-outline" size={20} color={colors.primary} />
                <CustomText style={styles.todayButtonText}>Back to Today</CustomText>
              </TouchableOpacity>
            </View>
          )}

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
    dotsContainer: {
      position: 'absolute',
      bottom: scale(4),
      flexDirection: 'row',
      gap: scale(2),
    },
    calendarDot: {
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
    calendarDotCheckIn: {
      backgroundColor: colors.success,
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
    todayButtonContainer: {
      paddingHorizontal: scale(16),
      marginTop: verticalScale(8),
    },
    todayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.playerCardBackground,
      borderRadius: scale(12),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(16),
      borderWidth: 1,
      borderColor: colors.primary,
      gap: scale(8),
    },
    todayButtonText: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.primary,
    },
  });
