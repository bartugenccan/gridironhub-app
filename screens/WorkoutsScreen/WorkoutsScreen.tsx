import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Swipeable } from 'react-native-gesture-handler';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { Workout } from '@/api/types/workouts';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppRoutes } from '@/types/navigation';
import { useAppNavigation, useGetWorkouts, useDeleteWorkout } from '@/hooks';

const WorkoutRow = ({
  workout,
  colors,
  onPress,
  onDelete,
  isCoach,
}: {
  workout: Workout;
  colors: typeof import('@/constants/Colors').LightColors;
  onPress?: () => void;
  onDelete?: () => void;
  isCoach?: boolean;
}) => {
  const styles = getStyles(colors);

  const renderRightActions = () => {
    if (!isCoach || !onDelete) {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.error }]}
        onPress={onDelete}
        activeOpacity={0.8}>
        <MaterialCommunityIcons name="delete" size={24} color="#fff" />
        <CustomText style={styles.deleteActionText}>Delete</CustomText>
      </TouchableOpacity>
    );
  };

  const content = (
    <TouchableOpacity style={styles.workoutRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.workoutContent}>
        <View style={styles.workoutIcon}>
          <MaterialCommunityIcons name="dumbbell" size={24} color={colors.recordIconColor} />
        </View>
        <View style={styles.workoutInfo}>
          <CustomText style={styles.workoutName}>{workout.name}</CustomText>
          {workout.description && (
            <CustomText style={styles.workoutDescription} numberOfLines={1}>
              {workout.description}
            </CustomText>
          )}
          <View style={styles.metaContainer}>
            <View style={styles.durationContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
              <CustomText style={styles.workoutDuration}>{workout?.durationMinutes} min</CustomText>
            </View>
            {workout.scheduledDate && (
              <View style={styles.dateContainer}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <CustomText style={styles.workoutDate}>
                  {new Date(workout.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (isCoach && onDelete) {
    return (
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        {content}
      </Swipeable>
    );
  }

  return content;
};

export const WorkoutsScreen = () => {
  const layout = useWindowDimensions();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { data: workouts, isLoading: isLoadingWorkouts } = useGetWorkouts();
  const { mutateAsync: deleteWorkout, isPending: isDeleting } = useDeleteWorkout();

  const isCoach = user?.role === 'coach';

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'team', title: 'Team Workouts' },
    { key: 'position', title: 'Position Drills' },
  ]);
  const [teamWorkouts, setTeamWorkouts] = useState<Workout[]>([]);
  const [positionWorkouts, setPositionWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (workouts) {
      setTeamWorkouts(workouts.teamWorkouts);
      setPositionWorkouts(workouts.positionWorkouts);
    }
  }, [workouts]);

  // Group workouts by date
  const groupWorkoutsByDate = (workouts: Workout[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const grouped: {
      date: string;
      label: string;
      workouts: Workout[];
    }[] = [];

    const unscheduled: Workout[] = [];
    const byDate: Map<string, Workout[]> = new Map();

    workouts.forEach((workout) => {
      if (!workout.scheduledDate) {
        unscheduled.push(workout);
        return;
      }

      const workoutDate = new Date(workout.scheduledDate + 'T00:00:00');
      workoutDate.setHours(0, 0, 0, 0);
      const dateKey = workout.scheduledDate;

      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(workout);
    });

    // Sort dates
    const sortedDates = Array.from(byDate.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    sortedDates.forEach((dateKey) => {
      const date = new Date(dateKey + 'T00:00:00');
      date.setHours(0, 0, 0, 0);
      const workouts = byDate.get(dateKey)!;

      let label: string;
      if (date.getTime() === today.getTime()) {
        label = 'Today';
      } else if (date.getTime() === tomorrow.getTime()) {
        label = 'Tomorrow';
      } else {
        label = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }

      grouped.push({ date: dateKey, label, workouts });
    });

    // Add unscheduled at the end
    if (unscheduled.length > 0) {
      grouped.push({ date: '', label: 'Unscheduled', workouts: unscheduled });
    }

    return grouped;
  };

  const groupedTeamWorkouts = useMemo(() => groupWorkoutsByDate(teamWorkouts), [teamWorkouts]);
  const groupedPositionWorkouts = useMemo(
    () => groupWorkoutsByDate(positionWorkouts),
    [positionWorkouts]
  );

  const handleWorkoutPress = (workout: Workout) => {
    navigation.navigate(AppRoutes.WORKOUTS_DETAIL, { workoutId: workout.id });
  };

  const handleDeleteWorkout = (workout: Workout, workoutList: 'team' | 'position') => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workout.id);
              // Optimistically update local state
              if (workoutList === 'team') {
                setTeamWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
              } else {
                setPositionWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
              }
            } catch (error) {
              console.error('Failed to delete workout:', error);
              Alert.alert('Error', 'Failed to delete workout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const TeamRoute = () => (
    <View style={styles.tabContent}>
      {isLoadingWorkouts ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : groupedTeamWorkouts.length > 0 ? (
        <FlatList
          data={groupedTeamWorkouts}
          keyExtractor={(group) => group.date || 'unscheduled'}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <CustomText style={styles.dateGroupLabel}>{group.label}</CustomText>
              {group.workouts.map((workout) => (
                <WorkoutRow
                  key={workout.id}
                  workout={workout}
                  colors={colors}
                  onPress={() => handleWorkoutPress(workout)}
                  onDelete={isCoach ? () => handleDeleteWorkout(workout, 'team') : undefined}
                  isCoach={isCoach}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>No team workouts available</CustomText>
        </View>
      )}
    </View>
  );

  const PositionRoute = () => (
    <View style={styles.tabContent}>
      {isLoadingWorkouts ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : groupedPositionWorkouts.length > 0 ? (
        <FlatList
          data={groupedPositionWorkouts}
          keyExtractor={(group) => group.date || 'unscheduled'}
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <CustomText style={styles.dateGroupLabel}>{group.label}</CustomText>
              {group.workouts.map((workout) => (
                <WorkoutRow
                  key={workout.id}
                  workout={workout}
                  colors={colors}
                  onPress={() => handleWorkoutPress(workout)}
                  onDelete={isCoach ? () => handleDeleteWorkout(workout, 'position') : undefined}
                  isCoach={isCoach}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>No position workouts available</CustomText>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText style={styles.headerTitle}>Workouts</CustomText>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={({ route }) => {
          switch (route.key) {
            case 'team':
              return <TeamRoute />;
            case 'position':
              return <PositionRoute />;
            default:
              return null;
          }
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            activeColor={colors.primary}
            inactiveColor={colors.textSecondary}
            pressColor={`${colors.primary}1A`}
          />
        )}
      />
    </View>
  );
};

const getStyles = (colors: typeof import('@/constants/Colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    header: {
      display: 'flex',
      justifyContent: 'flex-end',
      height: verticalScale(80),
      paddingBottom: verticalScale(12),
      paddingHorizontal: scale(20),
      backgroundColor: colors.playerCardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
    },
    tabBar: {
      backgroundColor: colors.playerCardBackground,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    tabIndicator: {
      backgroundColor: colors.primary,
      height: 3,
    },
    tabLabel: {
      fontFamily: Typography.fontFamily.semiBold,
      fontSize: 14,
      textTransform: 'none',
    },
    tabContent: {
      flex: 1,
      backgroundColor: colors.playerDashboardBackground,
    },
    listContainer: {
      padding: scale(16),
    },
    workoutRow: {
      backgroundColor: colors.playerCardBackground,
      borderRadius: 12,
      marginBottom: verticalScale(12),
      borderWidth: scale(1),
      borderColor: colors.borderLight,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    workoutContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(16),
    },
    workoutIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.recordIconBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: scale(12),
    },
    workoutInfo: {
      flex: 1,
    },
    workoutName: {
      fontSize: 16,
      fontFamily: Typography.fontFamily.semiBold,
      color: colors.text,
      marginBottom: verticalScale(4),
    },
    durationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
    },
    workoutDuration: {
      fontSize: 14,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
    },
    workoutDescription: {
      fontSize: 13,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
      marginBottom: verticalScale(2),
    },
    loader: {
      marginTop: 40,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: verticalScale(40),
    },
    emptyText: {
      fontSize: 16,
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
    },
    deleteAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: scale(80),
      borderRadius: 12,
      marginBottom: verticalScale(12),
      paddingHorizontal: scale(16),
    },
    deleteActionText: {
      color: '#fff',
      fontSize: scale(12),
      fontFamily: Typography.fontFamily.semiBold,
      marginTop: verticalScale(4),
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(16),
      marginTop: verticalScale(4),
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(4),
    },
    workoutDate: {
      fontSize: scale(14),
      fontFamily: Typography.fontFamily.regular,
      color: colors.textSecondary,
    },
    dateGroup: {
      marginBottom: verticalScale(24),
    },
    dateGroupLabel: {
      fontSize: scale(16),
      fontFamily: Typography.fontFamily.bold,
      color: colors.text,
      marginBottom: verticalScale(12),
      marginTop: verticalScale(8),
      paddingHorizontal: scale(16),
    },
  });
