import { createStackNavigator } from '@react-navigation/stack';
import { Roster } from '@/screens/Roster';
import { AppRoutes, RosterStackParamList } from '@/types/navigation';
import { Login } from '@/screens/Login';

const Stack = createStackNavigator<RosterStackParamList>();

export const TeamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.ROSTER} component={Roster} />
      <Stack.Screen name={AppRoutes.LOGIN} component={Login} />
    </Stack.Navigator>
  );
};
