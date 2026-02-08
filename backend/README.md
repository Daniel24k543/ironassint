# Iron Assistant Backend

Backend API para Iron Assistant - Aplicación de Fitness con Inteligencia Artificial.

## 🚀 Características

- 🔐 Autenticación con Firebase y JWT
- 💳 Integración completa con Stripe para suscripciones
- 🏋️‍♀️ Sistema completo de gestión de entrenamientos
- 📊 Tracking de métricas y progreso de usuarios
- 🎯 Sistema de logros y gamificación
- 📱 Notificaciones push inteligentes
- 🤖 Integración con OpenAI para IA Coach
- 📈 Analytics y métricas de uso
- 🔄 Rate limiting y seguridad

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de datos**: PostgreSQL con Knex.js
- **Autenticación**: Firebase Admin SDK + JWT
- **Pagos**: Stripe
- **Cache**: Redis (opcional)
- **IA**: OpenAI GPT-4
- **Logging**: Winston
- **Testing**: Jest + Supertest

## 📦 Instalación

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 12+
- Redis (opcional, para sesiones)
- Cuenta de Firebase
- Cuenta de Stripe
- Cuenta de OpenAI

### 1. Clonar e instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=iron_assistant_dev

# Firebase
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_BASIC_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
STRIPE_PRICE_LIFETIME=price_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# JWT
JWT_SECRET=tu-super-secreto-jwt-key
```

### 3. Crear base de datos

```bash
# Crear base de datos PostgreSQL
createdb iron_assistant_dev
createdb iron_assistant_test
```

### 4. Ejecutar migraciones

```bash
npm run migrate
```

### 5. (Opcional) Ejecutar seeds

```bash
npm run seed
```

## 🚦 Ejecutar la aplicación

### Desarrollo

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`

**URL de Producción:** `https://ironassint-production.up.railway.app`

### Producción

```bash
npm start
```

### Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar con coverage
npm test -- --coverage
```

## 📚 API Documentation

### Endpoints principales

#### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registro con email/password
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/firebase` - Autenticación con Firebase
- `POST /api/auth/refresh` - Renovar token JWT
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Recuperar password

#### Usuarios (`/api/users`)

- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/preferences` - Actualizar preferencias
- `GET /api/users/stats` - Estadísticas del usuario

#### Suscripciones (`/api/subscriptions`)

- `GET /api/subscriptions/plans` - Planes disponibles
- `GET /api/subscriptions/current` - Suscripción actual
- `POST /api/subscriptions/create-payment-intent` - Pago único
- `POST /api/subscriptions/create-subscription` - Suscripción recurrente
- `POST /api/subscriptions/cancel` - Cancelar suscripción
- `GET /api/subscriptions/billing-history` - Historial de facturación

#### Entrenamientos (`/api/workouts`)

- `GET /api/workouts` - Lista de entrenamientos del usuario
- `POST /api/workouts` - Crear nuevo entrenamiento
- `GET /api/workouts/:id` - Obtener entrenamiento específico
- `PUT /api/workouts/:id` - Actualizar entrenamiento
- `POST /api/workouts/:id/complete` - Completar entrenamiento

#### Notificaciones (`/api/notifications`)

- `GET /api/notifications` - Lista de notificaciones
- `POST /api/notifications/token` - Registrar push token
- `PUT /api/notifications/:id/read` - Marcar como leída

#### IA Coach (`/api/ai`)

- `POST /api/ai/chat` - Chat con IA
- `POST /api/ai/workout-plan` - Generar plan de entrenamiento
- `POST /api/ai/nutrition-advice` - Consejos de nutrición

### Autenticación

La API usa autenticación Bearer token. Incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

### Códigos de respuesta

- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto
- `422` - Error de validación
- `429` - Rate limit excedido
- `500` - Error del servidor

## 🗄️ Base de Datos

### Esquema principal

#### Usuarios y perfiles

- `users` - Información de usuarios y autenticación
- `user_profiles` - Perfiles detallados con datos físicos y preferencias

#### Suscripciones y pagos

- `subscriptions` - Suscripciones activas de Stripe
- `payments` - Historial de pagos y transacciones
- `payment_methods` - Métodos de pago guardados
- `coupons` - Cupones y descuentos
- `coupon_redemptions` - Uso de cupones

#### Entrenamientos

- `exercises` - Catálogo de ejercicios
- `workout_plans` - Planes de entrenamiento predefinidos
- `workouts` - Entrenamientos de usuarios
- `workout_exercises` - Ejercicios específicos en entrenamientos
- `user_exercise_records` - Records personales de ejercicios

#### Métricas y progreso

- `user_metrics` - Métricas corporales y de salud
- `user_progress` - Progreso diario de usuarios
- `achievements` - Catálogo de logros
- `user_achievements` - Logros obtenidos por usuarios

#### Sistema

- `notifications` - Notificaciones de usuarios
- `push_tokens` - Tokens de dispositivos para push notifications

### Migraciones

Crear nueva migración:

```bash
npx knex migrate:make nombre_de_migracion
```

Ejecutar migraciones:

```bash
npm run migrate
```

Rollback de migraciones:

```bash
npm run migrate:rollback
```

## 🔧 Servicios Externos

### Firebase

- Autenticación de usuarios
- Verificación de tokens ID

### Stripe

- Procesamiento de pagos
- Gestión de suscripciones
- Webhooks para actualizaciones de estado

### OpenAI

- IA Coach para entrenamientos personalizados
- Análisis de progreso y recomendaciones
- Chat inteligente con usuarios

### PostgreSQL

- Base de datos principal
- Almacenamiento de todos los datos de la aplicación

### Redis (Opcional)

- Sesiones de usuario
- Cache temporal
- Rate limiting

## 📊 Monitoreo y Logs

### Logs

Los logs se almacenan en la carpeta `logs/`:

- `error.log` - Solo errores
- `combined.log` - Todos los logs
- `performance.log` - Métricas de rendimiento

### Métricas

- Logs de API con tiempo de respuesta
- Tracking de autenticación
- Métricas de suscripciones y pagos
- Eventos de entrenamientos
- Insights de IA

### Health Check

```bash
GET /health
```

Respuesta:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "environment": "development",
  "database": "connected",
  "redis": "connected",
  "uptime": 1234.56
}
```

## 🔒 Seguridad

### Medidas implementadas

- Helmet.js para headers de seguridad
- Rate limiting por IP y usuario
- Validación de entrada con express-validator
- Sanitización de datos
- CORS configurado
- Logs de eventos de seguridad

### Rate Limits

- General: 100 requests/15min por IP
- Auth: 5 attempts/15min por usuario
- Subscriptions: 10 operations/min por usuario

## 🚀 Deploy

### Variables de entorno requeridas en producción

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=secure-random-string
STRIPE_SECRET_KEY=sk_live_xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nKEY\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=sk-xxxxx
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx (ejemplo)

```nginx
server {
    listen 80;
    server_name api.ironassistant.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🧪 Testing

### Estructura de tests

```
tests/
├── unit/          # Tests unitarios
├── integration/   # Tests de integración
├── e2e/          # Tests end-to-end
└── fixtures/     # Datos de prueba
```

### Ejecutar tests

```bash
# Todos los tests
npm test

# Solo unit tests
npm test -- --testPathPattern=unit

# Con coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 License

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:

- Email: dev@ironassistant.app
- Discord: [Iron Assistant Developers](https://discord.gg/ironassistant)
- Issues: [GitHub Issues](https://github.com/ironassistant/backend/issues)

---

Desarrollado con ❤️ por el equipo de Iron Assistant
