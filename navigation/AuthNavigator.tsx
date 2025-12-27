import { Welcome } from '@/screens';
import { SignUp, Login } from '@/screens';
import { PendingApprovalScreen } from '@/screens/Login/PendingApprovalScreen';
import { SetPasswordScreen } from '@/screens/Login/SetPasswordScreen';
import { AppRoutes, AuthStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';

const Auth = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Auth.Navigator screenOptions={{ headerShown: false }}>
    <Auth.Screen name={AppRoutes.WELCOME} component={Welcome} />
    <Auth.Screen name={AppRoutes.SIGN_UP} component={SignUp} />
    <Auth.Screen name={AppRoutes.LOGIN} component={Login} />
    <Auth.Screen name={AppRoutes.PENDING_APPROVAL} component={PendingApprovalScreen} />
    <Auth.Screen name={AppRoutes.SET_PASSWORD} component={SetPasswordScreen} />
  </Auth.Navigator>
);
