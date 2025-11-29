export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    ME: '/api/auth/me',
  },
  USER: {
    UPDATE_PROFILE: '/user/profile/update',
    GET_PROFILE: '/user/profile',
    GET_TEAM: '/user/team',
  },
  STATS: {
    GET_PERSONAL_RECORDS: '/api/stats/personal-records',
    UPDATE_PERSONAL_RECORD: '/api/stats/personal-records',
    GET_PERSONAL_RECORD_HISTORY: '/api/stats/personal-records/history', // Appending /:liftName in service
    DELETE_PERSONAL_RECORD: '/api/stats/personal-records', // Appending /:id in service
  },
  ROSTER: {
    GET_ROSTER: '/api/roster',
  },
  PLAYER: {
    GET_PROFILE: '/api/profiles/players', // Appending /:id in service
    UPDATE_PROFILE: '/api/profiles/players', // Appending /:id in service
  },
  WORKOUTS: {
    GET_WORKOUTS: '/api/workouts',
    GET_WORKOUTS_DETAIL: '/api/workouts/:id', // Appending /:id in service
  },

  // Add other endpoint groups
} as const;
