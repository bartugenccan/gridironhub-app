export enum AppRoutes {
  // Root Level
  AUTH = 'Auth',
  MAIN = 'Main',

  // Main Stack
  TABS = 'Tabs', // New route for TabNavigator
  NON_TAB_SCREEN = 'NonTabScreen',
  MODAL_SCREEN = 'ModalScreen',

  // Auth Stack
  WELCOME = 'Welcome',
  SIGN_UP = 'SignUp',
  LOGIN = 'Login',

  // Tab Screens
  DASHBOARD = 'Dashboard',
  PR_DETAIL = 'PRDetail',
  ADD_PR = 'AddPR',
  ROSTER = 'Roster',
  PLAYER_PROFILE = 'PlayerProfile',
  WORKOUTS = 'Workouts',
  PROFILE = 'Profile',
  PROFILE_EDIT = 'ProfileEdit',

  // Old routes (kept for compatibility)
  HOME = 'Home',
  HOME_DETAIL = 'HomeDetail',
  SETTINGS = 'Settings',
  SETTINGS_DETAIL = 'SettingsDetail',
}

export enum TabRoutes {
  DASHBOARD = 'DashboardTab',
  ROSTER = 'Roster',
  WORKOUTS = 'WorkoutsTab',
  PROFILE = 'ProfileTab',
}
