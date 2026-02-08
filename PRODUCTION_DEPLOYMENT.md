# GymIA Production Deployment Guide

## 🚀 Configuración para Producción

### Prerrequisitos

1. **Servidor Cloud** (VPS/Dedicated)
   - Ubuntu 20.04+ LTS
   - 2GB+ RAM
   - 20GB+ Disco
   - Node.js 18+
   - PostgreSQL 14+
   - Redis 6+
   - Nginx

2. **Servicios Cloud**
   - **Firebase** - Autenticación
   - **Stripe** - Pagos
   - **OpenAI** - IA
   - **Expo Push Notifications**
   - **Dominio personalizado + SSL**

### Instalación del Servidor

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 4. Instalar Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 5. Instalar Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 6. Instalar PM2 (Process Manager)
sudo npm install -g pm2
```

### Configuración de Base de Datos

```bash
# 1. Crear usuario y base de datos PostgreSQL
sudo -u postgres psql

CREATE USER gymia_user WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE gymia_production OWNER gymia_user;
GRANT ALL PRIVILEGES ON DATABASE gymia_production TO gymia_user;
\\q

# 2. Configurar Redis (opcional, para sesiones avanzadas)
sudo nano /etc/redis/redis.conf
# Configurar password, bind, etc.
```

### Configuración del Backend

```bash
# 1. Clonar repositorio
cd /var/www
sudo git clone https://github.com/tu-usuario/gymia.git
cd gymia/backend

# 2. Instalar dependencias
sudo npm install --production

# 3. Configurar variables de entorno
sudo cp .env.example .env
sudo nano .env
```

**Archivo `.env` de Producción:**

```env
# Server
NODE_ENV=production
PORT=3000
API_URL=https://api.tu-dominio.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymia_production
DB_USER=gymia_user
DB_PASSWORD=tu_password_seguro

# Redis (opcional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=tu_redis_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro_2024

# Firebase Admin
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-***@tu-proyecto-firebase.iam.gserviceaccount.com

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_***
STRIPE_SECRET_KEY=sk_live_***
STRIPE_WEBHOOK_SECRET=whsec_***

# OpenAI
OPENAI_API_KEY=sk-***

# Push Notifications
EXPO_ACCESS_TOKEN=tu_expo_access_token

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=tu_session_secret_largo_y_seguro

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Webhooks
GITHUB_WEBHOOK_SECRET=tu_github_webhook_secret

# Logging
LOG_LEVEL=info
```

```bash
# 4. Ejecutar migraciones
npm run migrate

# 5. Configurar PM2
sudo nano ecosystem.config.js
```

**Archivo `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [
    {
      name: "gymia-api",
      script: "./src/server.js",
      instances: 2, // Usar 2 instancias para load balancing
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "/var/log/gymia/error.log",
      out_file: "/var/log/gymia/out.log",
      log_file: "/var/log/gymia/combined.log",
      max_memory_restart: "1G",
      watch: false,
      autorestart: true,
    },
  ],
};
```

```bash
# 6. Crear directorio de logs
sudo mkdir -p /var/log/gymia
sudo chown -R www-data:www-data /var/log/gymia

# 7. Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configuración de Nginx

```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/gymia
```

**Archivo `/etc/nginx/sites-available/gymia`:**

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=webhooks:10m rate=5r/s;

server {
    listen 80;
    server_name api.tu-dominio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tu-dominio.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.tu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Webhooks with special rate limiting
    location /api/webhooks/ {
        limit_req zone=webhooks burst=10 nodelay;

        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60;
        client_max_body_size 1M;
    }

    # Health Check (sin rate limiting)
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # Block access to sensitive files
    location ~ /\\. {
        deny all;
    }

    location ~ ^/(package\\.json|ecosystem\\.config\\.js|\\.env)$ {
        deny all;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/gymia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Configuración SSL con Let's Encrypt

```bash
# 1. Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtener certificado SSL
sudo certbot --nginx -d api.tu-dominio.com

# 3. Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuración del Frontend Mobile

```typescript
// app.config.ts
export default {
  expo: {
    name: "GymIA",
    slug: "gymia-fitness",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.tuempresa.gymia",
      buildNumber: "1.0.0",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000000",
      },
      package: "com.tuempresa.gymia",
      versionCode: 1,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      apiUrl: "https://api.tu-dominio.com/api",
      eas: {
        projectId: "tu-proyecto-eas-id",
      },
    },
    plugins: ["expo-notifications", "expo-av", "expo-sensors"],
  },
};
```

### Scripts de Monitoreo

```bash
# Crear script de monitoreo
sudo nano /usr/local/bin/gymia-monitor.sh
```

**Script `/usr/local/bin/gymia-monitor.sh`:**

```bash
#!/bin/bash

# Monitorear servicios críticos
check_service() {
    service=$1
    if ! systemctl is-active --quiet $service; then
        echo "⚠️ $service está inactivo, reiniciando..."
        systemctl restart $service
        sleep 5

        if systemctl is-active --quiet $service; then
            echo "✅ $service reiniciado correctamente"
        else
            echo "❌ Error: No se pudo reiniciar $service"
            # Enviar alerta aquí (email, Slack, etc.)
        fi
    else
        echo "✅ $service está funcionando correctamente"
    fi
}

# Verificar API
check_api() {
    response=$(curl -s -o /dev/null -w "%{http_code}" https://api.tu-dominio.com/health)
    if [ "$response" != "200" ]; then
        echo "⚠️ API no responde correctamente (HTTP $response)"
        pm2 restart gymia-api
        sleep 10

        response=$(curl -s -o /dev/null -w "%{http_code}" https://api.tu-dominio.com/health)
        if [ "$response" == "200" ]; then
            echo "✅ API reiniciada correctamente"
        else
            echo "❌ Error: API sigue sin responder"
        fi
    else
        echo "✅ API respondiendo correctamente"
    fi
}

# Verificar espacio en disco
check_disk_space() {
    usage=$(df /var/log | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$usage" -gt 80 ]; then
        echo "⚠️ Espacio en disco al $usage%, limpiando logs..."
        find /var/log/gymia -name "*.log" -type f -mtime +7 -delete
        echo "✅ Logs antiguos eliminados"
    fi
}

echo "🔍 Iniciando monitoreo de GymIA - $(date)"

check_service postgresql
check_service redis-server
check_service nginx
check_api
check_disk_space

echo "✅ Monitoreo completado - $(date)"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/gymia-monitor.sh

# Configurar cron para ejecutar cada 5 minutos
sudo crontab -e
# Agregar: */5 * * * * /usr/local/bin/gymia-monitor.sh >> /var/log/gymia/monitor.log 2>&1
```

### Configuración de Backups

```bash
# Script de backup
sudo nano /usr/local/bin/gymia-backup.sh
```

**Script `/usr/local/bin/gymia-backup.sh`:**

```bash
#!/bin/bash

BACKUP_DIR="/backup/gymia"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
echo "🗄️ Creando backup de la base de datos..."
sudo -u postgres pg_dump gymia_production | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup de archivos de configuración
echo "📁 Creando backup de configuraciones..."
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz /var/www/gymia/backend/.env /etc/nginx/sites-available/gymia

# Cleanup - mantener solo los últimos 7 días
find $BACKUP_DIR -name "*.gz" -type f -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete

echo "✅ Backup completado: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/gymia-backup.sh

# Configurar backup diario
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/gymia-backup.sh >> /var/log/gymia/backup.log 2>&1
```

### Configuración de Firewall

```bash
# Configurar UFW (Ubuntu Firewall)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Permitir PostgreSQL solo desde localhost
sudo ufw allow from 127.0.0.1 to any port 5432

# Habilitar firewall
sudo ufw --force enable
sudo ufw status
```

### Configuración Final y Testing

```bash
# 1. Verificar que todos los servicios estén funcionando
sudo systemctl status postgresql redis-server nginx

# 2. Verificar PM2
pm2 status

# 3. Verificar logs
tail -f /var/log/gymia/out.log

# 4. Test de la API
curl https://api.tu-dominio.com/health

# 5. Test de autenticación
curl -X POST https://api.tu-dominio.com/api/auth/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Variables de Entorno para el App Mobile

```typescript
// constants/Config.ts
const config = {
  API_URL: __DEV__
    ? "http://localhost:3000/api"
    : "https://ironassint-production.up.railway.app/api",

  STRIPE_PUBLISHABLE_KEY: __DEV__ ? "pk_test_..." : "pk_live_...",

  FIREBASE_CONFIG: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
  },
};

export default config;
```

## 🔧 Mantenimiento Post-Deploy

### Comandos Útiles

```bash
# Ver logs en tiempo real
pm2 logs gymia-api

# Reiniciar API
pm2 restart gymia-api

# Ver estado del sistema
pm2 monit

# Verificar conexiones DB
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='gymia_production';"

# Verificar uso de Redis
redis-cli info memory

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

### Actualizaciones

```bash
# 1. Backup antes de actualizar
/usr/local/bin/gymia-backup.sh

# 2. Actualizar código
cd /var/www/gymia
sudo git pull origin main

# 3. Instalar nuevas dependencias
cd backend
sudo npm install --production

# 4. Ejecutar migraciones (si las hay)
npm run migrate

# 5. Reiniciar servicios
pm2 restart gymia-api
sudo systemctl reload nginx
```

## ✅ ¡Listo para Producción!

Tu app GymIA ahora está completamente configurada para producción con:

- ✅ **Backend API** con Express.js + PostgreSQL + Redis
- ✅ **Autenticación** Firebase + JWT
- ✅ **Pagos** Stripe completamente integrado
- ✅ **IA** OpenAI para entrenador personal
- ✅ **Analytics** Sistema completo de métricas
- ✅ **Webhooks** Para Stripe y otros servicios
- ✅ **Notificaciones** Push notifications inteligentes
- ✅ **Monitoreo** Scripts automáticos de salud del sistema
- ✅ **Backups** Automáticos diarios
- ✅ **SSL/HTTPS** Certificados automáticos
- ✅ **Seguridad** Firewall + Headers de seguridad + Rate limiting

¡Tu aplicación está lista para escalar y recibir usuarios reales! 🚀💪
