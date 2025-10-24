# MVPP Web - Trivia Game 🎮

> Aplicación web de trivia multijugador con IA generativa y diseño gaming

## 📁 Estructura del Proyecto

```
mvpp-web/
├── frontend/                    # Angular 20 - Interfaz de usuario
│   ├── src/app/
│   │   ├── componentes/         # Componentes de UI
│   │   │   ├── splash/          # Pantalla inicial con timer
│   │   │   ├── login/           # Autenticación AWS Cognito
│   │   │   ├── dashboard/       # Panel principal con widgets
│   │   │   ├── configurar-sala/ # Crear/configurar salas
│   │   │   ├── lobby/           # Sala de espera multijugador
│   │   │   ├── juego/           # Motor de juego principal
│   │   │   ├── entrenamiento/   # Modo práctica individual
│   │   │   ├── about/           # Información del proyecto
│   │   │   └── background/      # Background animado
│   │   ├── servicios/           # Servicios centralizados
│   │   │   ├── salas/           # Gestión de salas (HTTP)
│   │   │   ├── cognitoAuth/     # Autenticación AWS Cognito
│   │   │   ├── gemini/          # Integración Gemini AI
│   │   │   └── estadisticas/    # Gateway de datos (Frontend ↔ Backend)
│   │   └── theme/               # Variables SCSS globales
├── backend/                     # Express.js - API y WebSockets
│   ├── src/
│   │   ├── routes/              # Rutas HTTP RESTful
│   │   │   ├── index.js         # Router principal
│   │   │   ├── rooms.js         # Gestión de salas
│   │   │   ├── games.js         # Lógica de juego
│   │   │   └── stats.js         # Métricas y ranking
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── dynamoService.js # Cliente DynamoDB
│   │   │   ├── salasService.js  # Gestión de salas
│   │   │   ├── estadisticasService.js # Estadísticas y ranking
│   │   │   ├── initTables.js    # Inicialización de tablas
│   │   │   └── listTables.js    # Listado de tablas
│   │   └── app.js               # Servidor Express + Socket.IO
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 20)               │
├─────────────────────────────────────────────────────────┤
│ Splash → Login → Dashboard → [Crear | Unirse | Entrenar] │
│     ↓      ↓         ↓            ↓        ↓        ↓    │
│   Timer  Auth    Configurar → Lobby → Juego ← Entrenar    │
│                                                         │
│ Servicios Implementados:                               │
│ • CognitoAuthService (Autenticación completa)           │
│ • GeminiService (IA para avatares y preguntas)        │
│ • EstadisticasService (Gateway de datos)               │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                │
├─────────────────────────────────────────────────────────┤
│ Routes: /api/rooms /api/games /api/estadisticas         │
│ Services: SalasService, EstadisticasService            │
│ WebSocket: Socket.IO para tiempo real                  │
│ DynamoDB: Cliente configurado con Tailscale             │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                 SERVICIOS EXTERNOS                      │
├─────────────────────────────────────────────────────────┤
│ • AWS DynamoDB (Persistencia NoSQL)                     │
│ • Google Gemini API (Generación IA)                     │
│ • AWS Cognito (Autenticación JWT)                       │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitectura de Servicios

### **Frontend Services (Implementados)**

#### **CognitoAuthService** - Autenticación Completa
- **Propósito:** Gestión completa de usuarios con AWS Cognito
- **Características:**
  - Signals reactivos para estado de autenticación
  - Manejo de errores personalizado
  - Flujos: Login → SignUp → Confirmación → Dashboard
  - Gestión de sesiones automática

#### **GeminiService** - IA Generativa
- **Propósito:** Generación de avatares y preguntas con Google Gemini API
- **Características:**
  - Generación de avatares SVG personalizados
  - Fallbacks robustos cuando la IA falla
  - Integración directa con Gemini API
  - Sistema de hash para consistencia

#### **EstadisticasService** - Gateway de Datos
- **Propósito:** Puerta única entre Frontend ↔ Backend ↔ DynamoDB
- **Funciones:**
  - `obtenerEstadisticasPersonales()` → Datos para Dashboard
  - `obtenerRankingGlobal()` → Top jugadores
  - `obtenerProgresoParcial()` → Métricas rápidas
  - `guardarResultadoPartida()` → Persistencia
  - `verificarMejoraRanking()` → Notificaciones

### **Backend Services (Implementados)**

#### **DynamoService** - Cliente de Base de Datos
- **Propósito:** Operaciones CRUD con AWS DynamoDB
- **Características:**
  - Cliente configurado con Tailscale Funnel
  - SSL/HTTPS habilitado
  - Operaciones: crear, obtener, consultar, actualizar

#### **SalasService** - Gestión de Salas
- **Propósito:** Administración de salas multijugador
- **Funciones:**
  - Crear salas con códigos únicos
  - Unirse a salas existentes
  - Gestión de estado de salas

#### **EstadisticasService** - Métricas y Ranking
- **Propósito:** Persistencia y consulta de estadísticas
- **Funciones:**
  - Guardar resultados de partidas
  - Ranking global y por temática
  - Estadísticas personales por usuario

#### **WebSocket Handler** - Tiempo Real
- **Propósito:** Comunicación en tiempo real para multijugador
- **Eventos:** join-room, user-joined, disconnect
- **CORS:** Configurado para frontend Angular

## 🚀 Desarrollo

### Frontend (Angular 20)
```bash
cd frontend
npm install
ng serve
# http://localhost:4200
```

### Backend (Express.js)
```bash
cd backend
npm install
npm run dev
# http://localhost:3000
```

### Base de Datos (DynamoDB)
```bash
cd backend
npm run setup-db
# Inicializa las tablas en DynamoDB
```

## 🛠️ Stack Tecnológico

### **Frontend**
- **Framework:** Angular 20 con Standalone Components
- **Lenguaje:** TypeScript
- **Estilos:** SCSS con variables globales
- **Estado:** Signals reactivos
- **UI:** Diseño gaming con tema neon

### **Backend**
- **Framework:** Express.js
- **Lenguaje:** JavaScript/Node.js
- **Tiempo Real:** Socket.IO
- **Base de Datos:** AWS DynamoDB (NoSQL)
- **Cliente DB:** AWS SDK v3

### **Servicios Externos**
- **IA:** Google Gemini API
- **Autenticación:** AWS Cognito
- **Base de Datos:** AWS DynamoDB
- **Conectividad:** Tailscale Funnel (HTTPS)

### **Características Técnicas**
- **Arquitectura:** Frontend/Backend separados
- **Comunicación:** HTTP REST + WebSockets
- **Persistencia:** NoSQL serverless
- **Seguridad:** JWT + HTTPS
- **Escalabilidad:** Auto-escalado DynamoDB

## 📊 Estado del Desarrollo

### ✅ **Frontend (Refactorizado y Conectado)**
- **Arquitectura de Servicios:** Implementada y modular (`CognitoAuth`, `Rooms`, `Estadisticas`).
- **Flujo de Autenticación:** Completo y funcional con AWS Cognito.
- **Flujo de Salas:** El Dashboard, Configurar Sala y Lobby están conectados al backend vía HTTP.
- **Sin Datos Hardcodeados:** Los componentes principales ahora consumen datos reales de la API.
- **Entornos:** Configurado para desarrollo y producción (`environments`).

### ✅ **Backend (Implementado)**
- **API REST:** Rutas completas para salas, juegos y estadísticas
- **WebSockets:** Socket.IO configurado para tiempo real
- **Base de Datos:** Cliente DynamoDB con Tailscale
- **Servicios:** SalasService y EstadisticasService operativos
- **Tablas:** Scripts de inicialización de DynamoDB listos.

### 🔄 **Integración (En Progreso)**
- **Frontend ↔ Backend (HTTP):** Conexión establecida y funcional para la gestión de salas y estadísticas.
- **WebSockets (Pendiente):** Falta implementar la lógica en el frontend para recibir actualizaciones en tiempo real (ej. nuevos jugadores en el lobby).
- **DynamoDB:** Persistencia de datos
- **Testing:** Validación de funcionalidades

### 📋 **Próximos Pasos**
1. **Conectar Frontend con Backend** - Completar integración
2. **Implementar lógica multijugador** - WebSocket handlers
3. **Testing end-to-end** - Validar flujos completos
4. **Completar Lógica de Juego** - Generación de preguntas con Gemini y flujo de partida.
5. **Despliegue** - AWS App Runner

## 🎯 Características Destacadas

### **🎮 Experiencia de Usuario**
- **Diseño Gaming:** Tema neon con animaciones
- **Generación de Avatares:** IA personalizada
- **Modo Multijugador:** Salas en tiempo real
- **Entrenamiento Individual:** Práctica personalizada
- **Estadísticas:** Ranking y progreso

### **🔧 Arquitectura Técnica**
- **Separación Frontend/Backend:** Desarrollo independiente
- **Servicios Centralizados:** Fallbacks robustos
- **Base de Datos NoSQL:** Escalabilidad automática
- **IA Integrada:** Contenido dinámico
- **Tiempo Real:** WebSockets para multijugador

## ⚙️ Configuración del Proyecto

### **Variables de Entorno Requeridas**

#### **Frontend (Angular)**
```typescript
// src/app/servicios/cognitoAuth/cognito-config.ts
export const COGNITO_CONFIG = {
  userPoolId: 'us-east-1_XXXXXXXXX',
  userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX'
};

// src/app/servicios/gemini/gemini.config.ts
export const geminiConfig = {
  USE_AWS_BEDROCK: false,
  AWS_REGION: 'us-east-1',
  BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0'
};
```

#### **Backend (Express)**
```javascript
// DynamoDB configurado con Tailscale Funnel
const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'AccessKeyId',
    secretAccessKey: 'SecretAccessKey'
  },
  endpoint: 'https://asustor-server.tail96fddd.ts.net/',
  tls: true
});
```

### **Tablas de DynamoDB**
- **`mvpp-salas`** - Salas de juego multijugador
- **`mvpp-estadisticas`** - Resultados y métricas de usuarios
- **`mvpp-usuarios`** - Información de usuarios registrados

### **Endpoints de la API**
- **`GET /api`** - Estado de la API
- **`POST /api/rooms`** - Crear sala
- **`GET /api/rooms/:roomCode`** - Obtener sala
- **`POST /api/rooms/:roomCode/join`** - Unirse a sala
- **`POST /api/games/start`** - Iniciar juego
- **`POST /api/games/save-result`** - Guardar resultado
- **`GET /api/estadisticas/:userId`** - Estadísticas personales
- **`GET /api/estadisticas/ranking`** - Ranking global

## 📱 Flujo de Usuario

### **1. Autenticación**
```
Splash (3s) → Login → Registro/Confirmación → Dashboard
```

### **2. Modo Multijugador**
```
Dashboard → Crear Sala → Lobby → Juego → Resultados
Dashboard → Unirse Sala → Lobby → Juego → Resultados
```

### **3. Modo Entrenamiento**
```
Dashboard → Entrenamiento → Juego Individual → Estadísticas
```

### **4. Generación de Avatar**
```
Dashboard → Generador Avatar → Preguntas IA → Avatar Personalizado
```

## 🚀 Despliegue

### **Desarrollo Local**
```bash
# Terminal 1 - Frontend
cd frontend && npm install && ng serve

# Terminal 2 - Backend  
cd backend && npm install && npm run dev

# Terminal 3 - Base de Datos
cd backend && npm run setup-db
```

### **Producción (AWS)**
- **Frontend:** AWS App Runner (Angular)
- **Backend:** AWS App Runner (Express)
- **Base de Datos:** AWS DynamoDB
- **Autenticación:** AWS Cognito
- **IA:** Google Gemini API

---

**MVPP Web** - Una experiencia de trivia gaming moderna con IA, multijugador en tiempo real y diseño innovador. 🎮✨
