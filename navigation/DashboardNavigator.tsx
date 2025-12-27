import { createStackNavigator } from '@react-navigation/stack';
import { PlayerDashboard, PRDetailScreen, AddPRScreen } from '@/screens/PlayerDashboard';
import { ScheduleScreen } from '@/screens/Schedule';
import { AppRoutes, DashboardStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<DashboardStackParamList>();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.DASHBOARD} component={PlayerDashboard} />
      <Stack.Screen name={AppRoutes.PR_DETAIL} component={PRDetailScreen} />
      <Stack.Screen name={AppRoutes.ADD_PR} component={AddPRScreen} />
      <Stack.Screen name={AppRoutes.SCHEDULE} component={ScheduleScreen} />
    </Stack.Navigator>
  );
};
