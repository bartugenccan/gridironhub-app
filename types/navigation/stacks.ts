import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import { AppRoutes, TabRoutes } from './routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutsDetail } from '@/api/types/workoutsDetail';

// Auth Stack
export type AuthStackParamList = {
  [AppRoutes.WELCOME]: undefined;
  [AppRoutes.SIGN_UP]: undefined;
  [AppRoutes.LOGIN]: undefined;
  // Add other auth routes as needed
};

// Tab Stack Param Lists
export type DashboardStackParamList = {
  [AppRoutes.DASHBOARD]: undefined;
  [AppRoutes.PR_DETAIL]: { liftName: string };
  [AppRoutes.ADD_PR]: {
    record?: {
      id: string;
      liftName: string;
      oneRepMax: number;
    };
    isEdit?: boolean;
  };
  [AppRoutes.SCHEDULE]: undefined;
};

export type RosterStackParamList = {
  [AppRoutes.ROSTER]: undefined;
  [AppRoutes.PLAYER_PROFILE]: { playerId: string };
  [AppRoutes.COACH_DETAIL]: { coachId: string };
};

export type WorkoutsStackParamList = {
  [AppRoutes.WORKOUTS]: undefined;
  [AppRoutes.WORKOUTS_DETAIL]: { workoutId: string };
};

export type ProfileStackParamList = {
  [AppRoutes.PROFILE]: undefined;
  [AppRoutes.PROFILE_EDIT]: undefined;
};

// Old stacks (kept for compatibility)
export type HomeStackParamList = {
  [AppRoutes.HOME]: undefined;
  [AppRoutes.HOME_DETAIL]: undefined;
};

export type SettingsStackParamList = {
  [AppRoutes.SETTINGS]: undefined;
  [AppRoutes.SETTINGS_DETAIL]: undefined;
};

// Tab Navigator
export type TabNavigatorParamList = {
  [TabRoutes.DASHBOARD]: NavigatorScreenParams<DashboardStackParamList>;
  [TabRoutes.ROSTER]: NavigatorScreenParams<RosterStackParamList>;
  [TabRoutes.WORKOUTS]: NavigatorScreenParams<WorkoutsStackParamList>;
  [TabRoutes.PROFILE]: NavigatorScreenParams<ProfileStackParamList>;
};

export type CoachDashboardStackParamList = {
  [AppRoutes.COACH_DASHBOARD]: undefined;
  [AppRoutes.ADD_WORKOUT]: undefined;
  [AppRoutes.COACH_ANALYTICS]: undefined;
  [AppRoutes.SCHEDULE]: undefined;
  [AppRoutes.PR_REQUESTS]: undefined;
  [AppRoutes.GYM_CHECKINS]: undefined;
};

export type CoachTabNavigatorParamList = {
  [TabRoutes.COACH_DASHBOARD]: NavigatorScreenParams<CoachDashboardStackParamList>;
  [TabRoutes.COACH_ROSTER]: NavigatorScreenParams<RosterStackParamList>; // Reusing Roster stack for now
  [TabRoutes.COACH_WORKOUTS]: NavigatorScreenParams<WorkoutsStackParamList>; // Reusing Workouts stack
  [TabRoutes.COACH_PROFILE]: undefined;
};

// Main Stack - Contains both TabNavigator and non-tab screens
export type MainStackParamList = {
  [AppRoutes.TABS]: NavigatorScreenParams<TabNavigatorParamList>;
  [AppRoutes.COACH_TABS]: NavigatorScreenParams<CoachTabNavigatorParamList>;
  [AppRoutes.NON_TAB_SCREEN]: undefined;
  [AppRoutes.MODAL_SCREEN]: undefined;
  // Add other non-tab screens here
};

// Root Navigator - Just switches between Auth and Main
export type RootStackParamList = {
  [AppRoutes.AUTH]: NavigatorScreenParams<AuthStackParamList>;
  [AppRoutes.MAIN]: NavigatorScreenParams<MainStackParamList>;
};

// Navigation Types
export type AppNavigationProp = NativeStackNavigationProp<
  RootStackParamList &
    MainStackParamList &
    DashboardStackParamList &
    RosterStackParamList &
    WorkoutsStackParamList &
    ProfileStackParamList &
    HomeStackParamList &
    SettingsStackParamList &
    AuthStackParamList
>;
export type AppRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;

// Screen Props Helper
export interface ScreenProps<T extends keyof RootStackParamList> {
  navigation: AppNavigationProp;
  route: AppRouteProp<T>;
}
