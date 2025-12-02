import { CustomTabBar } from '@/components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CoachTabNavigatorParamList } from '@/types/navigation/stacks';
import { TabRoutes, AppRoutes } from '@/types/navigation/routes';
import { CoachDashboard } from '@/screens/CoachDashboard/CoachDashboard';
import { CoachProfile } from '@/screens/CoachProfile';
import { AddWorkout } from '@/screens/AddWorkout';
import { TeamNavigator } from './TeamNavigator'; // Reusing TeamNavigator for Roster
import { WorkoutsNavigator } from './WorkoutsNavigator';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator<CoachTabNavigatorParamList>();
const Stack = createStackNavigator();

// Temporary placeholder screens
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title}</Text>
  </View>
);

const CoachDashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={AppRoutes.COACH_DASHBOARD} component={CoachDashboard} />
    <Stack.Screen name={AppRoutes.ADD_WORKOUT} component={AddWorkout} />
  </Stack.Navigator>
);

export const CoachTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name={TabRoutes.COACH_DASHBOARD} component={CoachDashboardStack} />
      <Tab.Screen name={TabRoutes.COACH_ROSTER} component={TeamNavigator} />
      <Tab.Screen name={TabRoutes.COACH_WORKOUTS} component={WorkoutsNavigator} />
      <Tab.Screen name={TabRoutes.COACH_PROFILE} component={CoachProfile} />
    </Tab.Navigator>
  );
};
