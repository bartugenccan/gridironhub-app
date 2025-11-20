import { Welcome } from '@/screens';
import { SignUp, Login } from '@/screens';
import { AppRoutes, AuthStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';

const Auth = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Auth.Navigator screenOptions={{ headerShown: false }}>
    <Auth.Screen name={AppRoutes.WELCOME} component={Welcome} />
    <Auth.Screen name={AppRoutes.SIGN_UP} component={SignUp} />
    <Auth.Screen name={AppRoutes.LOGIN} component={Login} />
  </Auth.Navigator>
);
