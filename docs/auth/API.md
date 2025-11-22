# Authentication API Reference

## Endpoints

### Login

Kullanıcı girişi için kullanılır.

**Endpoint:** `POST /api/auth/login`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
{
  email: string; // Kullanıcı email adresi
  password: string; // Kullanıcı şifresi
  role: 'coach' | 'player'; // Kullanıcı rolü
}
```

**Success Response (200):**

```typescript
{
  session: {
    accessToken: string; // API istekleri için kullanılacak token
    refreshToken: string; // Access token yenilemek için
    expiresIn: number; // Token geçerlilik süresi (saniye)
    tokenType: string; // Token tipi (örn: "Bearer")
  }
  user: {
    id: string; // Kullanıcı ID
    email: string; // Kullanıcı email
    role: 'coach' | 'player'; // Kullanıcı rolü
    metadata: Record<string, unknown>; // Ek kullanıcı bilgileri
  }
}
```

**Error Responses:**

- **400 Bad Request**

  ```json
  {
    "message": "Invalid email or password format"
  }
  ```

- **401 Unauthorized**

  ```json
  {
    "message": "Invalid credentials"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Server error"
  }
  ```

**Example Usage:**

```typescript
const response = await authService.login({
  email: 'coach@example.com',
  password: 'securePassword123',
  role: 'coach',
});

console.log(response.session.accessToken);
console.log(response.user.email);
```

---

### Register

Yeni kullanıcı kaydı için kullanılır.

**Endpoint:** `POST /api/auth/register`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
{
  email: string; // Kullanıcı email adresi
  password: string; // Kullanıcı şifresi (min 8 karakter)
  firstName: string; // Kullanıcı adı
  lastName: string; // Kullanıcı soyadı
}
```

**Success Response (201):**

```typescript
{
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      createdAt: string;
      updatedAt: string;
    }
    token: string; // Authentication token
  }
}
```

**Error Responses:**

- **400 Bad Request**

  ```json
  {
    "message": "Email already exists"
  }
  ```

- **422 Unprocessable Entity**
  ```json
  {
    "message": "Validation failed",
    "errors": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
  ```

**Example Usage:**

```typescript
const response = await authService.register({
  email: 'newuser@example.com',
  password: 'securePassword123',
  firstName: 'John',
  lastName: 'Doe',
});
```

---

### Forgot Password

Şifre sıfırlama isteği için kullanılır.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
{
  email: string; // Şifre sıfırlanacak email adresi
}
```

**Success Response (200):**

```json
{
  "message": "Password reset email sent"
}
```

**Error Responses:**

- **404 Not Found**
  ```json
  {
    "message": "User not found"
  }
  ```

**Example Usage:**

```typescript
await authService.forgotPassword('user@example.com');
```

---

## Protected Endpoints

Korumalı endpoint'lere erişim için `Authorization` header'ı gereklidir.

### Header Format

```
Authorization: Bearer {accessToken}
```

### Automatic Token Injection

Axios interceptor otomatik olarak token'ı ekler:

```typescript
// api/client.ts
axiosInstance.interceptors.request.use(async (config) => {
  const isPublicRoute = publicRoutes.some((route) => config.url?.includes(route));

  if (!isPublicRoute) {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});
```

### Example Protected Request

```typescript
// Token otomatik olarak eklenir
const userProfile = await axiosInstance.get('/api/user/profile');
```

---

## Error Handling

### Standard Error Response Format

```typescript
{
  message: string;           // Hata mesajı
  statusCode?: number;       // HTTP status code
  errors?: Record<string, string>; // Validation hataları
}
```

### Common HTTP Status Codes

| Code | Meaning               | Description            |
| ---- | --------------------- | ---------------------- |
| 200  | OK                    | İstek başarılı         |
| 201  | Created               | Kaynak oluşturuldu     |
| 400  | Bad Request           | Geçersiz istek         |
| 401  | Unauthorized          | Authentication gerekli |
| 403  | Forbidden             | Yetki yok              |
| 404  | Not Found             | Kaynak bulunamadı      |
| 422  | Unprocessable Entity  | Validation hatası      |
| 500  | Internal Server Error | Sunucu hatası          |

### Error Handling Example

```typescript
try {
  await authService.login(credentials);
} catch (error: any) {
  const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';

  Alert.alert('Error', errorMessage);
}
```

---

## Rate Limiting

API rate limiting bilgileri:

- **Login Endpoint:** 5 istek / dakika
- **Register Endpoint:** 3 istek / dakika
- **Forgot Password:** 3 istek / saat

Rate limit aşıldığında:

**Response (429 Too Many Requests):**

```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

---

## Token Management

### Access Token

- **Geçerlilik Süresi:** 1 saat (3600 saniye)
- **Format:** JWT (JSON Web Token)
- **Kullanım:** Her API isteğinde Authorization header'ında

### Refresh Token

- **Geçerlilik Süresi:** 30 gün
- **Kullanım:** Access token yenilemek için
- **Endpoint:** `POST /api/auth/refresh` (TODO)

### Token Refresh Flow (Planned)

```typescript
// Gelecekte eklenecek
const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post('/api/auth/refresh', {
    refreshToken,
  });

  return response.data.accessToken;
};
```

---

## TypeScript Types

### LoginRequest

```typescript
interface LoginRequest {
  email: string;
  password: string;
  role: 'coach' | 'player';
}
```

### LoginResponse

```typescript
interface LoginResponse {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  user: {
    id: string;
    email: string;
    role: UserRole;
    metadata: Record<string, unknown>;
  };
}
```

### RegisterRequest

```typescript
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

### RegisterResponse

```typescript
interface RegisterResponse {
  data: {
    user: User;
    token: string;
  };
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
```

### AuthUser

```typescript
interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  metadata: Record<string, unknown>;
}
```

---

## Testing

### Test Credentials

**Coach Account:**

```
Email: coach@test.com
Password: TestPassword123
Role: coach
```

**Player Account:**

```
Email: player@test.com
Password: TestPassword123
Role: player
```

### Example Test Cases

```typescript
describe('Auth API', () => {
  it('should login successfully with valid credentials', async () => {
    const response = await authService.login({
      email: 'coach@test.com',
      password: 'TestPassword123',
      role: 'coach',
    });

    expect(response.session.accessToken).toBeDefined();
    expect(response.user.email).toBe('coach@test.com');
  });

  it('should fail login with invalid credentials', async () => {
    await expect(
      authService.login({
        email: 'wrong@test.com',
        password: 'wrongpassword',
        role: 'coach',
      })
    ).rejects.toThrow();
  });
});
```
