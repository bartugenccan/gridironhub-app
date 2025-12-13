import { createStackNavigator } from '@react-navigation/stack';
import { Roster } from '@/screens/Roster';
import { AppRoutes, RosterStackParamList } from '@/types/navigation';
import { PlayerProfile } from '@/screens/PlayerProfile';
import { CoachDetail } from '@/screens/index';

const Stack = createStackNavigator<RosterStackParamList>();

export const TeamNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={AppRoutes.ROSTER} component={Roster} />
      <Stack.Screen name={AppRoutes.PLAYER_PROFILE} component={PlayerProfile} />
      <Stack.Screen name={AppRoutes.COACH_DETAIL} component={CoachDetail} />
    </Stack.Navigator>
  );
};
