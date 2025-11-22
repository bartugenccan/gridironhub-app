import { createStackNavigator } from '@react-navigation/stack';
import { TeamScreen } from '@/screens/TeamScreen';
import { AppRoutes, TeamStackParamList } from '@/types/navigation';
import { Login } from '@/screens/Login';

const Stack = createStackNavigator<TeamStackParamList>();

export const TeamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.TEAM} component={TeamScreen} />
      <Stack.Screen name={AppRoutes.LOGIN} component={Login} />
    </Stack.Navigator>
  );
};
