import { CustomTabBar } from '@/components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabNavigatorParamList } from '@/types/navigation/stacks';
import { TabRoutes } from '@/types/navigation/routes';
import { DashboardNavigator } from './DashboardNavigator';
import { TeamNavigator } from './TeamNavigator';
import { WorkoutsNavigator } from './WorkoutsNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name={TabRoutes.DASHBOARD} component={DashboardNavigator} />
      <Tab.Screen name={TabRoutes.TEAM} component={TeamNavigator} />
      <Tab.Screen name={TabRoutes.WORKOUTS} component={WorkoutsNavigator} />
      <Tab.Screen name={TabRoutes.PROFILE} component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
