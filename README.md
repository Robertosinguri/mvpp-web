# MVPP Web - Trivia Game 🎮

> Aplicación web de trivia multijugador con IA generativa

## 📁 Estructura del Proyecto

```
mvpp-web/
├── frontend/                    # Angular 20 - Interfaz de usuario
│   ├── src/app/
│   │   ├── componentes/         # Componentes de UI
│   │   │   ├── splash/          # Pantalla inicial
│   │   │   ├── login/           # Autenticación
│   │   │   ├── dashboard/       # Panel principal
│   │   │   ├── configurar-sala/ # Crear/configurar salas
│   │   │   ├── lobby/           # Sala de espera multijugador
│   │   │   ├── juego/           # Motor de juego
│   │   │   ├── entrenamiento/   # Modo práctica
│   │   │   └── gaming-neon-background/ # Background animado
│   │   ├── servicios/           # Servicios centralizados
│   │   │   ├── cognitoAuth/     # Autenticación AWS Cognito
│   │   │   ├── gemini/          # Integración Gemini AI
│   │   │   └── estadisticas/    # Gateway de datos (Frontend ↔ Backend)
│   │   └── theme/               # Variables SCSS globales
├── backend/                     # Express.js - API y WebSockets
│   ├── src/
│   │   ├── routes/              # Rutas HTTP
│   │   │   ├── auth.js          # Autenticación
│   │   │   ├── salas.js         # Gestión de salas
│   │   │   ├── juegos.js        # Lógica de juego
│   │   │   └── estadisticas.js  # Métricas y ranking
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── authService.js   # Validación de usuarios
│   │   │   ├── salasService.js  # Gestión de salas
│   │   │   ├── juegosService.js # Motor de juego
│   │   │   └── geminiService.js # Generación de preguntas IA
│   │   ├── middleware/          # Middlewares personalizados
│   │   └── websockets/          # Eventos tiempo real
└── shared/                      # Tipos TypeScript compartidos
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 20)               │
├─────────────────────────────────────────────────────────┤
│ Dashboard → [Crear Sala | Unirse | Entrenamiento]      │
│     ↓            ↓         ↓           ↓               │
│ Configurar → Lobby → Juego ← Entrenamiento             │
│                                                         │
│ Servicios:                                              │
│ • EstadisticasService (Gateway datos)                   │
│ • GeminiService (IA preguntas)                          │
│ • CognitoAuthService (Autenticación)                    │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                │
├─────────────────────────────────────────────────────────┤
│ Routes: /auth /salas /juegos /estadisticas              │
│ Services: AuthService, SalasService, JuegosService      │
│ WebSocket: Tiempo real multijugador                    │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                 SERVICIOS EXTERNOS                      │
├─────────────────────────────────────────────────────────┤
│ • AWS DynamoDB (Persistencia)                           │
│ • Google Gemini API (Generación IA)                     │
│ • AWS Cognito (Autenticación)                           │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Arquitectura de Servicios

### **Frontend Services (Centralizados)**

#### **EstadisticasService** - Gateway Principal
- **Propósito:** Puerta única de datos entre Frontend ↔ Backend ↔ DynamoDB
- **Funciones:**
  - `obtenerEstadisticasPersonales()` → Datos para Entrenamiento
  - `obtenerRankingGlobal()` → Top jugadores (Dashboard widget)
  - `obtenerProgresoParcial()` → Métricas rápidas
  - `guardarResultadoPartida()` → Persistencia en DynamoDB
  - `verificarMejoraRanking()` → Notificaciones de progreso

#### **GeminiService** - IA Generativa
- **Propósito:** Generación de preguntas con Google Gemini API
- **Características:**
  - Sistema de reintentos (3 intentos)
  - Parsing robusto de markdown
  - Sin fallbacks genéricos (mantiene credibilidad IA)
  - Timeout de 20 segundos

#### **CognitoAuthService** - Autenticación
- **Propósito:** Gestión completa de usuarios con AWS Cognito
- **Flujos:** Login → SignUp → Confirmación → Dashboard

### **Backend Services (Planificados)**
- **Rutas RESTful** para operaciones CRUD
- **WebSocket handlers** para tiempo real
- **Integración DynamoDB** para persistencia
- **Middleware de validación** y seguridad

## 🚀 Desarrollo

### Frontend (Angular 20)
```bash
cd frontend
npm install
ng serve
# http://localhost:4200
```

### Backend (Express - En desarrollo)
```bash
cd backend
npm install
npm run dev
# http://localhost:3000
```

## 🛠️ Stack Tecnológico

- **Frontend:** Angular 20, TypeScript, SCSS, Standalone Components
- **Backend:** Express.js, Socket.IO, TypeScript
- **Base de Datos:** AWS DynamoDB (NoSQL)
- **IA:** Google Gemini 2.0 Flash API
- **Auth:** AWS Cognito (JWT)
- **Deploy:** AWS App Runner (Containers)
- **Tiempo Real:** WebSockets para multijugador

## 🎯 Reorganización del Proyecto

### **Antes (Estructura Mixta):**
```
mvpp-web/
├── src/ (mezclado frontend/backend)
└── componentes/ (sin organización)
```

### **Después (Separación Profesional):**
```
mvpp-web/
├── frontend/ (Angular independiente)
├── backend/ (Express independiente)
└── shared/ (Tipos compartidos)
```

### **Beneficios de la Reorganización:**
- ✅ **Separación clara** de responsabilidades
- ✅ **Desarrollo independiente** Frontend/Backend
- ✅ **Preparado para Docker** y despliegue
- ✅ **Escalabilidad** y mantenimiento
- ✅ **Servicios centralizados** con fallbacks

## 📊 Estado del Desarrollo

### ✅ **Frontend (Completado)**
- Componentes principales implementados
- Servicios centralizados funcionando
- Theme system con variables SCSS
- Background gaming neon animado
- Integración Gemini AI operativa
- Sistema de autenticación completo

### 🚧 **Backend (Siguiente Fase)**
- Estructura base definida
- Rutas y servicios planificados
- Integración DynamoDB pendiente
- WebSockets para tiempo real

### 📋 **Próximos Pasos**
1. Implementar backend Express.js
2. Configurar DynamoDB y tablas
3. Desarrollar WebSocket handlers
4. Integración Frontend ↔ Backend
5. Despliegue en AWS App Runner
