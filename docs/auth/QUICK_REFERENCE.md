# Authentication Quick Reference

Hızlı erişim için en sık kullanılan kod parçaları ve örnekler.

---

## 🚀 Quick Start

### 1. Login Ekranı (Minimal)

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const Login = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login({ email, password, role: 'coach' });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} disabled={isLoading} />
    </View>
  );
};
```

### 2. Protected Screen

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPrompt />;

  return <Text>Welcome {user?.email}</Text>;
};
```

### 3. Logout Button

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const LogoutButton = () => {
  const { logout } = useAuth();

  return <Button title="Logout" onPress={logout} />;
};
```

---

## 📦 useAuth Hook

### Available Properties

```typescript
const {
  user, // AuthUser | null
  token, // string | null
  isAuthenticated, // boolean
  isLoading, // boolean
  login, // (credentials) => Promise<void>
  register, // (data) => Promise<void>
  logout, // () => Promise<void>
  updateUser, // (user) => void
} = useAuth();
```

### User Object

```typescript
user = {
  id: string;
  email: string;
  role: 'coach' | 'player';
  metadata: Record<string, unknown>;
}
```

---

## 🔐 Common Patterns

### Role-Based Rendering

```typescript
const { user } = useAuth();

{user?.role === 'coach' && <CoachFeature />}
{user?.role === 'player' && <PlayerFeature />}
```

### Conditional Navigation

```typescript
const { isAuthenticated } = useAuth();

useEffect(() => {
  if (!isAuthenticated) {
    navigation.navigate('Login');
  }
}, [isAuthenticated]);
```

### Loading State

```typescript
const { isLoading } = useAuth();

if (isLoading) return <ActivityIndicator />;
```

---

## 🌐 API Calls

### Protected Request

```typescript
// Token otomatik eklenir
const data = await axiosInstance.get('/api/protected-endpoint');
```

### Custom Service

```typescript
// api/services/myService.ts
import axiosInstance from '../client';

export const myService = {
  getData: () => axiosInstance.get('/api/data'),
  postData: (data) => axiosInstance.post('/api/data', data),
};
```

---

## ⚠️ Error Handling

### Try-Catch Pattern

```typescript
try {
  await login(credentials);
} catch (error: any) {
  const message = error?.response?.data?.message || 'Error occurred';
  Alert.alert('Error', message);
}
```

### Global Error Handler

```typescript
const handleError = (error: any) => {
  if (error?.response?.status === 401) {
    Alert.alert('Session Expired', 'Please login again');
    logout();
  } else {
    Alert.alert('Error', error?.message || 'Something went wrong');
  }
};
```

---

## 🎯 Validation

### Email Validation

```typescript
const isValidEmail = (email: string) => {
  return email.includes('@') && email.includes('.');
};
```

### Password Validation

```typescript
const isValidPassword = (password: string) => {
  return password.length >= 8;
};
```

### Complete Validation

```typescript
const validate = () => {
  if (!email.trim() || !password.trim()) {
    setError('All fields required');
    return false;
  }
  if (!isValidEmail(email)) {
    setError('Invalid email');
    return false;
  }
  if (!isValidPassword(password)) {
    setError('Password must be 8+ characters');
    return false;
  }
  return true;
};
```

---

## 🧪 Testing

### Mock useAuth

```typescript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com', role: 'coach' },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
```

---

## 📝 TypeScript Types

### Import Types

```typescript
import type { LoginRequest, LoginResponse, RegisterRequest, UserRole } from '@/api/types/auth';
```

### Type Definitions

```typescript
type UserRole = 'coach' | 'player';

interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}
```

---

## 🔧 Debugging

### Check Auth State

```typescript
const { user, token, isAuthenticated } = useAuth();

console.log('User:', user);
console.log('Token:', token);
console.log('Is Authenticated:', isAuthenticated);
```

### Check AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStorage = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  const user = await AsyncStorage.getItem('userData');
  console.log('Stored Token:', token);
  console.log('Stored User:', user);
};
```

### Clear Storage (for testing)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAuth = async () => {
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
};
```

---

## 🎨 UI Components

### Login Form

```typescript
<View>
  <TextInput
    placeholder="Email"
    value={email}
    onChangeText={setEmail}
    autoCapitalize="none"
    keyboardType="email-address"
  />
  <TextInput
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry
  />
  {error && <Text style={{ color: 'red' }}>{error}</Text>}
  <Button title="Login" onPress={handleLogin} />
</View>
```

### Loading Button

```typescript
<TouchableOpacity
  onPress={handleSubmit}
  disabled={isLoading}
  style={[styles.button, isLoading && styles.disabled]}
>
  {isLoading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text>Submit</Text>
  )}
</TouchableOpacity>
```

---

## 📚 Useful Links

- [Main Documentation](./README.md)
- [API Reference](./API.md)
- [Implementation Guide](./IMPLEMENTATION.md)

---

## 💡 Tips

1. **Always check `isLoading`** before showing content
2. **Use try-catch** for all async operations
3. **Validate inputs** before API calls
4. **Don't log sensitive data** (passwords, tokens)
5. **Let navigation happen automatically** after login/logout
6. **Use `useAuth` hook** instead of direct AsyncStorage access
7. **Token injection is automatic** via axios interceptor

---

## 🐛 Common Issues

| Problem                                    | Solution                            |
| ------------------------------------------ | ----------------------------------- |
| "useAuth must be used within AuthProvider" | Wrap app with `<AuthProvider>`      |
| Token not sent in requests                 | Check if route is in `publicRoutes` |
| Login doesn't navigate                     | Check `AppNavigator` logic          |
| User logged out on app restart             | Check `checkAuthStatus` function    |

---

## 📞 Support

Sorunlar için:

1. [README.md](./README.md) - Mimari ve flow
2. [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Detaylı örnekler
3. [API.md](./API.md) - Endpoint referansı
