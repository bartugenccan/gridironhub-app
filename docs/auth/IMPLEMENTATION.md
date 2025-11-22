# Authentication Implementation Guide

Bu guide, authentication sistemini yeni bir ekrana veya feature'a nasıl entegre edeceğinizi adım adım açıklar.

---

## 1. Temel Kullanım

### useAuth Hook'u Kullanma

En basit kullanım şekli `useAuth` hook'unu import etmektir:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const MyScreen = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user?.email}</Text>
    </View>
  );
};
```

---

## 2. Login Ekranı Oluşturma

### Adım 1: State Tanımlama

```typescript
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
```

### Adım 2: Validation Fonksiyonu

```typescript
const validateInputs = () => {
  if (!email.trim() || !password.trim()) {
    setError('Please enter both email and password');
    return false;
  }

  if (!email.includes('@')) {
    setError('Please enter a valid email address');
    return false;
  }

  if (password.length < 8) {
    setError('Password must be at least 8 characters');
    return false;
  }

  return true;
};
```

### Adım 3: Login Handler

```typescript
const handleLogin = async (role: 'coach' | 'player') => {
  setError('');

  if (!validateInputs()) {
    return;
  }

  try {
    await login({
      email: email.trim(),
      password,
      role,
    });
    // Navigation otomatik olarak gerçekleşir
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Login failed. Please try again.';
    setError(errorMessage);
    Alert.alert('Login Error', errorMessage);
  }
};
```

### Adım 4: UI Render

```typescript
  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        onPress={() => handleLogin('coach')}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text>Login as Coach</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};
```

---

## 3. Protected Screen Oluşturma

### Yöntem 1: Hook ile Kontrol

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const ProfileScreen = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="Login" />;
  }

  return (
    <View>
      <Text>Profile: {user?.email}</Text>
    </View>
  );
};
```

### Yöntem 2: HOC (Higher Order Component)

```typescript
// components/withAuth.tsx
export const withAuth = (Component: React.ComponentType) => {
  return (props: any) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <LoadingScreen />;
    }

    if (!isAuthenticated) {
      return <LoginScreen />;
    }

    return <Component {...props} />;
  };
};

// Kullanım
export const ProtectedScreen = withAuth(() => {
  return <View><Text>Protected Content</Text></View>;
});
```

---

## 4. Role-Based Access Control

### Basit Role Kontrolü

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const DashboardScreen = () => {
  const { user } = useAuth();

  return (
    <View>
      {user?.role === 'coach' && (
        <CoachDashboard />
      )}

      {user?.role === 'player' && (
        <PlayerDashboard />
      )}
    </View>
  );
};
```

### Custom Hook ile Role Kontrolü

```typescript
// hooks/useRole.ts
import { useAuth } from '@/contexts/AuthContext';

export const useRole = () => {
  const { user } = useAuth();

  return {
    isCoach: user?.role === 'coach',
    isPlayer: user?.role === 'player',
    role: user?.role,
  };
};

// Kullanım
export const FeatureScreen = () => {
  const { isCoach, isPlayer } = useRole();

  return (
    <View>
      {isCoach && <CoachOnlyFeature />}
      {isPlayer && <PlayerOnlyFeature />}
    </View>
  );
};
```

---

## 5. API Çağrıları

### Otomatik Token Injection

Token'lar otomatik olarak eklenir, manuel işlem gerekmez:

```typescript
// ✅ Doğru - Token otomatik eklenir
const response = await axiosInstance.get('/api/user/profile');

// ❌ Yanlış - Manuel token eklemeye gerek yok
const token = await AsyncStorage.getItem('accessToken');
const response = await axios.get('/api/user/profile', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Custom API Service Oluşturma

```typescript
// api/services/user.service.ts
import axiosInstance from '../client';

export const userService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/api/user/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put('/api/user/profile', data);
    return response.data;
  },
};

// Kullanım
import { userService } from '@/api/services/user.service';

const profile = await userService.getProfile();
```

---

## 6. Logout İşlemi

### Basit Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const SettingsScreen = () => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation otomatik olarak Auth Stack'e döner
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} disabled={isLoading}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
};
```

### Onaylı Logout

```typescript
const handleLogout = () => {
  Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Logout',
      style: 'destructive',
      onPress: async () => {
        await logout();
      },
    },
  ]);
};
```

---

## 7. User Bilgilerini Güncelleme

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const EditProfileScreen = () => {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    try {
      // API'ye kaydet
      const updatedUser = await userService.updateProfile({ email });

      // Local state'i güncelle
      updateUser(updatedUser);

      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};
```

---

## 8. Loading States

### Global Loading

```typescript
import { useAuth } from '@/contexts/AuthContext';

export const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return <NavigationContainer>...</NavigationContainer>;
};
```

### Component Level Loading

```typescript
export const MyScreen = () => {
  const { isLoading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(false);

  const isLoading = authLoading || dataLoading;

  return (
    <View>
      {isLoading && <LoadingOverlay />}
      <Content />
    </View>
  );
};
```

---

## 9. Error Handling

### Global Error Handler

```typescript
// utils/errorHandler.ts
export const handleAuthError = (error: any) => {
  if (error?.response?.status === 401) {
    // Token expired veya invalid
    Alert.alert('Session Expired', 'Please login again', [{ text: 'OK', onPress: () => logout() }]);
  } else if (error?.response?.status === 403) {
    // Forbidden
    Alert.alert('Access Denied', 'You do not have permission');
  } else {
    // Generic error
    const message = error?.response?.data?.message || 'An error occurred';
    Alert.alert('Error', message);
  }
};

// Kullanım
try {
  await someApiCall();
} catch (error) {
  handleAuthError(error);
}
```

---

## 10. Testing

### Mock AuthContext

```typescript
// __mocks__/AuthContext.tsx
export const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    role: 'coach',
    metadata: {},
  },
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  updateUser: jest.fn(),
};

export const useAuth = () => mockAuthContext;
```

### Test Example

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

jest.mock('@/contexts/AuthContext');

describe('LoginScreen', () => {
  it('should call login with correct credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Email'),
      'test@example.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Password'),
      'password123'
    );
    fireEvent.press(getByText('Login'));

    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      role: 'coach'
    });
  });
});
```

---

## Best Practices

### ✅ Yapılması Gerekenler

1. **Her zaman useAuth hook'unu kullanın**

   ```typescript
   const { user, isAuthenticated } = useAuth();
   ```

2. **Loading state'leri kontrol edin**

   ```typescript
   if (isLoading) return <LoadingSpinner />;
   ```

3. **Error handling yapın**

   ```typescript
   try {
     await login(credentials);
   } catch (error) {
     handleError(error);
   }
   ```

4. **Input validation yapın**

   ```typescript
   if (!email.includes('@')) {
     setError('Invalid email');
     return;
   }
   ```

5. **Sensitive data'yı log'lamayın**

   ```typescript
   // ❌ Yanlış
   console.log('Password:', password);

   // ✅ Doğru
   console.log('Login attempt for:', email);
   ```

### ❌ Yapılmaması Gerekenler

1. **AsyncStorage'ı direkt kullanmayın**

   ```typescript
   // ❌ Yanlış
   const token = await AsyncStorage.getItem('accessToken');

   // ✅ Doğru
   const { token } = useAuth();
   ```

2. **Token'ı manuel olarak eklemeyin**

   ```typescript
   // ❌ Yanlış
   axios.get('/api/data', {
     headers: { Authorization: `Bearer ${token}` },
   });

   // ✅ Doğru
   axiosInstance.get('/api/data'); // Token otomatik eklenir
   ```

3. **Navigation'ı manuel yapmayın**

   ```typescript
   // ❌ Yanlış
   await login(credentials);
   navigation.navigate('Home');

   // ✅ Doğru
   await login(credentials); // Navigation otomatik
   ```

---

## Troubleshooting

### Problem: "useAuth must be used within an AuthProvider"

**Çözüm:** AuthProvider'ın component tree'nin en üstünde olduğundan emin olun.

### Problem: Token gönderilmiyor

**Çözüm:** Route'un public route listesinde olmadığından emin olun.

### Problem: Login sonrası navigation çalışmıyor

**Çözüm:** AppNavigator'da `isAuthenticated` prop'unun doğru kullanıldığını kontrol edin.
