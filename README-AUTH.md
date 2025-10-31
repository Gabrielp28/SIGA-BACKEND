# Sistema de Autenticación Completo - SIGA Backend

Este documento describe el sistema de autenticación implementado en el backend SIGA.

## Características

- ✅ Autenticación JWT (JSON Web Tokens)
- ✅ Registro de usuarios
- ✅ Login de usuarios
- ✅ Hash de contraseñas con bcrypt
- ✅ Protección de rutas con Guards
- ✅ Sistema de roles y permisos
- ✅ Validación de DTOs
- ✅ Documentación Swagger
- ✅ Validación global de pipes

## Estructura

### Módulos

- **AuthModule**: Módulo principal de autenticación
- **UsuarioModule**: Módulo de gestión de usuarios

### Componentes Principales

1. **AuthService**: Servicio con lógica de autenticación
   - `login()`: Autentica usuario y genera JWT
   - `register()`: Registra nuevo usuario
   - `validateUser()`: Valida credenciales
   - `validateJwtPayload()`: Valida token JWT

2. **AuthController**: Endpoints de autenticación
   - `POST /auth/login`: Iniciar sesión
   - `POST /auth/register`: Registrar usuario
   - `GET /auth/profile`: Obtener perfil del usuario autenticado
   - `POST /auth/validate`: Validar token JWT

3. **JwtStrategy**: Estrategia Passport para validar JWT

4. **Guards**:
   - `JwtAuthGuard`: Protege rutas con autenticación JWT
   - `RolesGuard`: Verifica roles del usuario

5. **Decorators**:
   - `@Public()`: Marca rutas como públicas
   - `@Roles(...roles)`: Especifica roles requeridos
   - `@CurrentUser()`: Obtiene usuario actual del request

## Configuración區

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d
```

### Protección Global de Rutas

Por defecto, todas las rutas están protegidas excepto las marcadas con `@Public()`.

Las rutas de autenticación (`/auth/login` y `/auth/register`) están marcadas como públicas.

## Uso

### 1. Registrar Usuario

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "roles": []
  }
}
```

### 2. Iniciar Sesión

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "roles": ["admin"]
  }
}
```

### 3. Usar Token en Peticiones

```bash
GET /usuario
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Obtener Perfil

```bash
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Validar Token

```bash
POST /auth/validate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Proteger Rutas con Roles

Ejemplo de cómo proteger una ruta con roles específicos:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin', 'superadmin')
  getDashboard() {
    return { message: 'Dashboard admin' };
  }
}
```

## Hacer Rutas Públicas

Para hacer una ruta pública (sin autenticación):

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Get('info')
  @Public()
  getInfo() {
    return { message: 'Esta ruta es pública' };
  }
}
```

## Obtener Usuario Actual

Para obtener el usuario actual en un controlador:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: any) {
    return {
      id: user.id_usuario,
      username: user.username,
      email: user.email,
      roles: user.roles,
    };
  }
}
```

## Documentación Swagger

La documentación interactiva está disponible en:
- URL: `http://localhost:3000/api/docs`

Desde Swagger puedes:
1. Probar todos los endpoints
2. Autenticarte usando el botón "Authorize"
3. Ver la estructura de los DTOs
4. Probar las respuestas

## Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT tienen expiración configurable
- Validación de datos de entrada con class-validator
- Protección CSRF con CORS configurado
- Validación de estado de usuario (solo usuarios activos)

## Próximos Pasos (Opcional)

- Implementar refresh tokens
- Agregar rate limiting
- Implementar 2FA (autenticación de dos factores)
- Agregar logging de intentos de login
- Implementar bloqueo de cuenta después de intentos fallidos

