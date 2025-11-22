import { createStackNavigator } from '@react-navigation/stack';
import { PlayerDashboard, PRDetailScreen } from '@/screens/PlayerDashboard';
import { AppRoutes, DashboardStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<DashboardStackParamList>();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.DASHBOARD} component={PlayerDashboard} />
      <Stack.Screen name={AppRoutes.PR_DETAIL} component={PRDetailScreen} />
    </Stack.Navigator>
  );
};
