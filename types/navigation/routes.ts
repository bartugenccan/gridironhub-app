export enum AppRoutes {
  // Root Level
  AUTH = 'Auth',
  MAIN = 'Main',

  // Main Stack
  TABS = 'Tabs', // New route for TabNavigator
  COACH_TABS = 'CoachTabs',
  NON_TAB_SCREEN = 'NonTabScreen',
  MODAL_SCREEN = 'ModalScreen',

  // Auth Stack
  WELCOME = 'Welcome',
  SIGN_UP = 'SignUp',
  LOGIN = 'Login',
  PENDING_APPROVAL = 'PendingApproval',
  SET_PASSWORD = 'SetPassword',

  // Tab Screens
  DASHBOARD = 'Dashboard',
  COACH_DASHBOARD = 'CoachDashboard',
  PR_DETAIL = 'PRDetail',
  ADD_PR = 'AddPR',
  ROSTER = 'Roster',
  PLAYER_PROFILE = 'PlayerProfile',
  WORKOUTS = 'Workouts',
  WORKOUTS_DETAIL = 'WorkoutsDetail',
  ADD_WORKOUT = 'AddWorkout',
  COACH_ANALYTICS = 'CoachAnalytics',
  PR_REQUESTS = 'PRRequests',
  SCHEDULE = 'Schedule',
  PROFILE = 'Profile',
  PROFILE_EDIT = 'ProfileEdit',
  COACH_DETAIL = 'CoachDetail',
  GYM_CHECKINS = 'GymCheckins',
  APPROVAL_DASHBOARD = 'ApprovalDashboard',

  // Old routes (kept for compatibility)
  HOME = 'Home',
  HOME_DETAIL = 'HomeDetail',
  SETTINGS = 'Settings',
  SETTINGS_DETAIL = 'SettingsDetail',
}

export enum TabRoutes {
  DASHBOARD = 'DashboardTab',
  ROSTER = 'RosterTab',
  WORKOUTS = 'WorkoutsTab',
  PROFILE = 'ProfileTab',

  // Coach Tabs
  COACH_DASHBOARD = 'CoachDashboardTab',
  COACH_ROSTER = 'CoachRosterTab',
  COACH_PROFILE = 'CoachProfileTab',
  COACH_WORKOUTS = 'CoachWorkoutsTab',
}
