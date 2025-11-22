import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutsScreen } from '@/screens/WorkoutsScreen';
import { AppRoutes, WorkoutsStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<WorkoutsStackParamList>();

export const WorkoutsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.WORKOUTS} component={WorkoutsScreen} />
    </Stack.Navigator>
  );
};
