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

const WorkoutRow = ({ workout }: { workout: Workout }) => {
  return (
    <TouchableOpacity style={styles.workoutRow} activeOpacity={0.7}>
      <View style={styles.workoutContent}>
        <View style={styles.workoutIcon}>
          <MaterialCommunityIcons name="dumbbell" size={24} color="#4CAF50" />
        </View>
        <View style={styles.workoutInfo}>
          <CustomText style={styles.workoutName}>{workout.name}</CustomText>
          {workout.description && (
            <CustomText style={styles.workoutDescription} numberOfLines={1}>
              {workout.description}
            </CustomText>
          )}
          <View style={styles.durationContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <CustomText style={styles.workoutDuration}>{workout.durationMinutes} min</CustomText>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

export const WorkoutsScreen = () => {
  const layout = useWindowDimensions();

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
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : teamWorkouts.length > 0 ? (
        <FlatList
          data={teamWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutRow workout={item} />}
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
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : positionWorkouts.length > 0 ? (
        <FlatList
          data={positionWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WorkoutRow workout={item} />}
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            activeColor="#4CAF50"
            inactiveColor="#999"
            pressColor="rgba(76, 175, 80, 0.1)"
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: '#000',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabIndicator: {
    backgroundColor: '#4CAF50',
    height: 3,
  },
  tabLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    textTransform: 'none',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: scale(16),
  },
  workoutRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#E8F5E9',
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
    color: '#000',
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
    color: '#666',
  },
  workoutDescription: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: '#888',
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
    color: '#999',
  },
});
