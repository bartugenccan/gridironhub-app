import { CustomTabBar } from '@/components';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CoachTabNavigatorParamList } from '@/types/navigation/stacks';
import { TabRoutes, AppRoutes } from '@/types/navigation/routes';
import { CoachDashboard } from '@/screens/CoachDashboard/CoachDashboard';
import { TeamNavigator } from './TeamNavigator'; // Reusing TeamNavigator for Roster
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
    </Stack.Navigator>
);

export const CoachTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}>
            <Tab.Screen name={TabRoutes.COACH_DASHBOARD} component={CoachDashboardStack} />
            <Tab.Screen name={TabRoutes.COACH_ROSTER} component={TeamNavigator} />
            <Tab.Screen name={TabRoutes.COACH_STATS} children={() => <PlaceholderScreen title="Stats" />} />
            <Tab.Screen name={TabRoutes.COACH_SCHEDULE} children={() => <PlaceholderScreen title="Schedule" />} />
        </Tab.Navigator>
    );
};
