# API Integration Guide - Autenticación Avanzada

## 🎯 Características Implementadas

### 1. **Refresh Automático de Tokens**

- El token se refresca automáticamente 1 minuto antes de expirar
- No requiere intervención del usuario
- Si el refresh falla, se logout automáticamente
- Ubicación: `src/contexts/AuthContext.tsx` (líneas: 77-110)

### 2. **Validación de Sesión**

- Al cargar la app, verifica si hay una sesión activa en localStorage
- Valida que el token sea válido contra el servidor
- Si el token está expirado, intenta refrescarlo
- Si falla, limpia la sesión automáticamente
- Ubicación: `src/contexts/AuthContext.tsx` (líneas: 113-149)

### 3. **Interceptor Global**

- Todas las peticiones HTTP agregan automáticamente el token Bearer
- Si recibe un 401, intenta refrescar el token y reintentar
- No requiere agregar headers manualmente en cada componente
- Ubicación: `src/services/api.ts` (líneas: 28-51)

### 4. **Manejo de Errores Avanzado**

- Clasifica errores: credenciales inválidas, error de red, servidor caído, etc.
- Proporciona mensajes amigables según el tipo de error
- Los componentes pueden acceder a `errorType` para diferentes UI
- Ubicación: `src/utils/errors.ts`

---

## 📝 Ejemplos de Uso

### En un Componente - Login

```tsx
import { useAuth } from "../../contexts/AuthContext";
import { getErrorMessage } from "../../utils/errors";

function LoginForm() {
  const { login, isLoading, error, errorType, clearError } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Redirigir a dashboard
    } catch (err) {
      // El error ya está en el estado
    }
  };

  return (
    <form>
      {error && <div className="error">{error}</div>}
      {/* Si prefieres un mensaje amigable: */}
      {errorType && <div>{getErrorMessage(errorType)}</div>}
      <button disabled={isLoading}>
        {isLoading ? "Cargando..." : "Login"}
      </button>
    </form>
  );
}
```

### Haciendo Peticiones GET con Token Automático

```tsx
import { useApiGet } from "../hooks/useApi";

function UsersList() {
  const { data: users, isLoading, error } = useApiGet<User[]>("/api/users");

  // Si el token está próximo a expirar, se refrescará automáticamente
  // El token se incluye automáticamente en el header

  return (
    <div>
      {isLoading && <p>Cargando...</p>}
      {error && <p>Error: {error.message}</p>}
      {users?.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
```

### Haciendo Peticiones POST/PUT/DELETE

```tsx
import { useApiPost, useApiPut, useApiDelete } from "../hooks/useApi";

function UserForm() {
  // POST
  const {
    mutate: createUser,
    isLoading,
    error,
  } = useApiPost<User>("/api/users");

  const handleCreate = async (userData: CreateUserDto) => {
    const result = await createUser(userData);
    if (result) {
      console.log("User created:", result);
    }
  };

  // PUT
  const { mutate: updateUser } = useApiPut<User>("/api/users/1", {
    onSuccess: () => console.log("Updated!"),
    onError: (error) => console.error(error),
  });

  // DELETE
  const { mutate: deleteUser, errorType } = useApiDelete("/api/users/1");

  return (
    <div>
      {error && <p>{getErrorMessage(error.type)}</p>}
      <button onClick={() => handleCreate({ email: "test@test.com" })}>
        Create User
      </button>
    </div>
  );
}
```

### Usando useAuth en cualquier Componente

```tsx
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <header>
      <span>Bienvenido {user?.email}</span>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
```

---

## 🔄 Flujo de Refresh de Token

```
1. Token próximo a expirar (1 minuto antes)
   ↓
2. AuthContext programa refresh automáticamente
   ↓
3. Llama a /api/auth/refresh-token con refresh_token
   ↓
4. Recibe nuevo access_token y refresh_token
   ↓
5. Actualiza localStorage y estado
   ↓
6. Programa siguiente refresh (1 minuto antes de expiración)
```

## 🚨 Flujo de Error y Re-intentos

```
1. Petición HTTP a /api/usuarios
   ↓
2. Recibe 401 Unauthorized (token expirado)
   ↓
3. Interceptor detecta 401
   ↓
4. Llama a refreshTokenCallback()
   ↓
5. Refresca token automáticamente
   ↓
6. Reintenta la petición original con nuevo token
   ↓
7. Si falla el refresh → logout automático
```

---

## 📂 Archivos Nuevos

| File                           | Purpose                                      |
| ------------------------------ | -------------------------------------------- |
| `src/utils/jwt.ts`             | Decodifica JWTs y verifica expiración        |
| `src/utils/errors.ts`          | Clasifica y traduce errores                  |
| `src/hooks/useApi.ts`          | Hooks para GET, POST, PUT, DELETE con tokens |
| `src/services/api.ts`          | Cliente HTTP con interceptor global          |
| `src/contexts/AuthContext.tsx` | Manejo de autenticación + refresh automático |

---

## ⚙️ Variables de Entorno

```bash
# .env.local
VITE_API_URL=http://localhost:3000
```

```bash
# Backend .env
CORS_ORIGIN=http://localhost:5173
```

---

## 🔐 Estados de Error Detectados

| ErrorType             | Causa                      | Cuando Ocurre                            |
| --------------------- | -------------------------- | ---------------------------------------- |
| `INVALID_CREDENTIALS` | Email/password incorrectos | Login fallido con credenciales inválidas |
| `NETWORK_ERROR`       | Sin conexión a internet    | Fetch falla (fetch error)                |
| `SERVER_ERROR`        | Servidor caído             | Status 500, 502, 503, 504                |
| `UNAUTHORIZED`        | Token inválido/expirado    | Status 401                               |
| `FORBIDDEN`           | Sin permisos               | Status 403                               |
| `NOT_FOUND`           | Recurso no existe          | Status 404                               |
| `VALIDATION_ERROR`    | Datos inválidos            | Status 400, 422                          |

---

## ✅ Checklist de Implementación

- ✅ Refresh automático de tokens (1 minuto antes de expirar)
- ✅ Validación de sesión al cargar la app
- ✅ Interceptor global que agrega tokens automáticamente
- ✅ Manejo de errores con clasificación y mensajes amigables
- ✅ Re-intentos automáticos en 401
- ✅ Hooks para facilitar peticiones HTTP
- ✅ Logout automático en caso de refresh fallido
- ✅ CORS habilitado en backend

---

## 🧪 Testing Manual

1. **Refresh Automático:**
   - Login
   - Esperar a que se acerque la expiración
   - Verr en console que se refrescan los tokens

2. **Validación de Sesión:**
   - Login
   - Recargar la página
   - Verificar que mantiene la sesión

3. **Interceptor:**
   - Hacer una petición GET sin agregar header manualmente
   - Verificar en Network que el header Authorization está presente

4. **Manejo de Errores:**
   - Intentar login con credenciales inválidas
   - Ver mensaje amigable
   - Intentar petición a endpoint que no existe
   - Ver 404 con mensaje apropiado
