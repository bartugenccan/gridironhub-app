import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { CustomText } from '@/components';
import { Typography } from '@/constants/Typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { scale, verticalScale } from 'react-native-size-matters';
import { workoutsService } from '@/api/services/workouts.service';
import { Workout } from '@/api/types/workouts';
import { useTheme } from '@/contexts/ThemeContext';

const WorkoutRow = ({
  workout,
  colors,
}: {
  workout: Workout;
  colors: typeof import('@/constants/Colors').LightColors;
}) => {
  const styles = getStyles(colors);
  return (
    <TouchableOpacity style={styles.workoutRow} activeOpacity={0.7}>
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
          <View style={styles.durationContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
            <CustomText style={styles.workoutDuration}>{workout?.durationMinutes} min</CustomText>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

export const WorkoutsScreen = () => {
  const layout = useWindowDimensions();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'team', title: 'Team Workouts' },
    { key: 'position', title: 'Position Drills' },
  ]);
  const [teamWorkouts, setTeamWorkouts] = useState<Workout[]>([]);
  const [positionWorkouts, setPositionWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutsService.getWorkouts();
      console.log('Workouts data:', data);
      console.log('Team workouts:', data.teamWorkouts);
      console.log('Position workouts:', data.positionWorkouts);
      setTeamWorkouts(data.teamWorkouts);
      setPositionWorkouts(data.positionWorkouts);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const TeamRoute = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : teamWorkouts.length > 0 ? (
        <FlatList
          data={teamWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutRow workout={item} colors={colors} />}
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
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : positionWorkouts.length > 0 ? (
        <FlatList
          data={positionWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutRow workout={item} colors={colors} />}
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
      display: "flex",
      justifyContent: "flex-end",
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
  });
