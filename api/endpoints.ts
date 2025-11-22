export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  USER: {
    UPDATE_PROFILE: '/user/profile/update',
    GET_PROFILE: '/user/profile',
    GET_TEAM: '/user/team',
  },
  STATS: {
    GET_PERSONAL_RECORDS: '/api/stats/personal-records',
  },

  // Add other endpoint groups
} as const;
