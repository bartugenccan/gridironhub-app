import { createStackNavigator } from '@react-navigation/stack';
import { PlayerDashboard } from '@/screens/PlayerDashboard';
import { AppRoutes, DashboardStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<DashboardStackParamList>();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.DASHBOARD} component={PlayerDashboard} />
    </Stack.Navigator>
  );
};
