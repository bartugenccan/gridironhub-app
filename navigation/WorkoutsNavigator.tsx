import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutsScreen } from '@/screens/WorkoutsScreen';
import { AppRoutes, WorkoutsStackParamList } from '@/types/navigation';
import { WorkoutsDetail } from '@/screens/WorkoutsDetail';

const Stack = createStackNavigator<WorkoutsStackParamList>();

export const WorkoutsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.WORKOUTS} component={WorkoutsScreen} />
      <Stack.Screen name={AppRoutes.WORKOUTS_DETAIL} component={WorkoutsDetail} />
    </Stack.Navigator>
  );
};
