import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { AppRoutes, RootStackParamList } from '@/types/navigation';

const linking: LinkingOptions<any> = {
  prefixes: [Linking.createURL('/'), 'gridironhub://'],
  config: {
    screens: {
      [AppRoutes.AUTH]: {
        screens: {
          [AppRoutes.LOGIN]: 'login',
          [AppRoutes.FORGOT_PASSWORD]: 'forgot-password',
          [AppRoutes.RESET_PASSWORD]: 'reset-password',
        },
      },
      [AppRoutes.MAIN]: {
        screens: {
          // Add other screens if needed
        },
      },
    },
  },
};

export default linking;
