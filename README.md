# TRIVIA WAR 🎮

> Aplicación web de trivia multijugador con IA generativa y diseño gaming neon

## 📁 Estructura del Proyecto

```
mvpp-web/
├── frontend/                    # Angular 20 - Interfaz de usuario
│   ├── src/app/
│   │   ├── componentes/         # Componentes de UI
│   │   │   ├── splash/          # Pantalla inicial con timer (12s)
│   │   │   ├── login/           # Autenticación AWS Cognito
│   │   │   ├── navbar/          # Navegación unificada con sidebar
│   │   │   ├── dashboard/       # Panel principal con validación
│   │   │   ├── configurar-sala/ # Crear/configurar salas
│   │   │   ├── lobby/           # Sala de espera multijugador
│   │   │   ├── juego/           # Modo entrenamiento individual
│   │   │   ├── arena/           # Arena multijugador sincronizada
│   │   │   ├── entrenamiento/   # Configuración práctica
│   │   │   ├── resultados/      # Resultados con ranking 4-cuadrantes
│   │   │   ├── ranking/         # Ranking global unificado
│   │   │   ├── about/           # Información del proyecto
│   │   │   └── background/      # Background animado
│   │   ├── servicios/           # Servicios centralizados
│   │   │   ├── salas/           # Gestión de salas (HTTP)
│   │   │   ├── cognitoAuth/     # Autenticación AWS Cognito
│   │   │   ├── gemini/          # Integración Gemini AI
│   │   │   ├── websocket/       # Comunicación tiempo real
│   │   │   └── estadisticas/    # Gateway de datos (Frontend ↔ Backend)
│   │   └── theme/               # Variables SCSS globales
├── backend/                     # Express.js - API y WebSockets
│   ├── src/
│   │   ├── routes/              # Rutas HTTP RESTful
│   │   │   ├── index.js         # Router principal
│   │   │   ├── rooms.js         # Gestión de salas
│   │   │   ├── games.js         # Lógica de juego + submit-result
│   │   │   └── stats.js         # Métricas y ranking
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── dynamoService.js # Cliente DynamoDB
│   │   │   ├── salasService.js  # Gestión de salas
│   │   │   ├── estadisticasService.js # Estadísticas unificadas
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
│   Timer  Auth    Configurar → Lobby → Arena ← Entrenar → Juego │
│                                                         │
│ Servicios Implementados:                               │
│ • CognitoAuthService (Autenticación completa)           │
│ • GeminiService (IA para avatares y preguntas)        │
│ • EstadisticasService (Gateway de datos)               │
│ • WebSocketService (Tiempo real multijugador)         │
│ • RoomsService (Gestión de salas)                     │
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
│ • DynamoDB en NAS (Persistencia NoSQL + Tailscale)                     │
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
  - `obtenerRankingGlobal()` → Top jugadores unificado
  - `obtenerProgresoParcial()` → Métricas rápidas
  - `guardarResultadoPartida()` → Persistencia
  - `verificarMejoraRanking()` → Notificaciones

#### **WebSocketService** - Tiempo Real
- **Propósito:** Comunicación en tiempo real para multijugador
- **Características:**
  - Conexión automática con reconexión
  - Eventos de sala: join-room, user-joined, disconnect
  - Sincronización de estados de juego
  - Manejo de errores robusto

#### **NavbarComponent** - Navegación Unificada
- **Propósito:** Componente reutilizable para navegación consistente
- **Características:**
  - Sidebar expandible con estadísticas de usuario
  - Navegación neon sin fondos
  - Integración con autenticación
  - Proyección de contenido con ng-content

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

#### **EstadisticasService** - Métricas y Ranking Unificado
- **Propósito:** Persistencia y consulta de estadísticas unificadas
- **Funciones:**
  - Guardar resultados de partidas individuales y multijugador
  - Ranking global unificado (mvpp-estadisticas + mvpp-resultados-partida)
  - Estadísticas personales por usuario
  - Evaluación centralizada de ganadores multijugador
  - Normalización de datos por username

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
# Se conecta a DynamoDB existente (NAS + Tailscale)
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
- **Conectividad:** Tailscale Funnel (NAS + HTTPS)

### **Características Técnicas**
- **Arquitectura:** Frontend/Backend separados
- **Comunicación:** HTTP REST + WebSockets
- **Persistencia:** NoSQL serverless
- **Seguridad:** JWT + HTTPS
- **Escalabilidad:** Auto-escalado DynamoDB

## 📊 Estado del Desarrollo

### ✅ **Frontend (Completamente Funcional)**
- **Arquitectura de Servicios:** Implementada y modular (`CognitoAuth`, `Rooms`, `Estadisticas`, `WebSocket`).
- **Navegación Unificada:** Componente navbar reutilizable con sidebar estadísticas.
- **Flujo de Autenticación:** Completo con display correcto de nombres de usuario.
- **Flujo Multijugador:** Dashboard → ConfigurarSala → Lobby → Arena → Resultados sincronizado.
- **Componentes Especializados:** Juego (entrenamiento) y Arena (multijugador) separados.
- **WebSocket Frontend:** Integrado para tiempo real en lobby y coordinación de partidas.
- **Validación de Entrada:** Códigos de sala con formato 6 caracteres alfanuméricos.
- **Diseño Neon:** Navegación con efectos de texto sin fondos, tema gaming consistente.

### ✅ **Backend (Completamente Funcional)**
- **API REST:** Rutas completas para salas, juegos y estadísticas
- **WebSockets:** Socket.IO configurado y operativo para tiempo real
- **Base de Datos:** Cliente DynamoDB con Tailscale funcionando
- **Servicios:** SalasService y EstadisticasService completamente operativos
- **Generación de Preguntas:** Endpoint para cuestionarios mixtos multijugador
- **Evaluación Multijugador:** Endpoint submit-result para evaluación centralizada de ganadores
- **Ranking Unificado:** Combinación de datos de múltiples tablas con normalización por username

### ✅ **Integración (Completada)**
- **Frontend ↔ Backend (HTTP):** Conexión completa y funcional.
- **WebSockets:** Implementados para actualizaciones en tiempo real del lobby.
- **DynamoDB:** Persistencia de datos operativa con múltiples tablas
- **Arena Multijugador:** Generación y mezcla de preguntas de múltiples jugadores
- **Resultados Sincronizados:** Evaluación centralizada de ganadores en backend
- **Flujo Completo:** Desde creación de sala hasta resultados multijugador funcionando
- **Ranking Global:** Sistema unificado que combina datos de entrenamientos y partidas multijugador

### 🎯 **Sistema Completado**
1. ✅ **Multijugador Completo** - Salas, lobby, arena, resultados sincronizados
2. ✅ **Tiempo Real** - WebSocket para coordinación de jugadores
3. ✅ **Generación IA** - Preguntas mixtas con Gemini API
4. ✅ **Persistencia** - DynamoDB operativo con múltiples tablas
5. ✅ **Navegación Unificada** - Navbar component con sidebar estadísticas
6. ✅ **Ranking Global** - Sistema unificado de estadísticas
7. ✅ **Validación de Entrada** - Códigos de sala y formularios
8. ✅ **Diseño Neon** - Tema gaming consistente
9. 📋 **Pendiente:** Despliegue en AWS App Runner

## 🎯 Características Destacadas

### **🎮 Experiencia de Usuario**
- **Diseño Gaming:** Tema neon con efectos de texto y animaciones
- **Navegación Consistente:** Navbar unificada con sidebar estadísticas
- **Generación de Avatares:** IA personalizada con Gemini
- **Modo Multijugador:** Salas en tiempo real con resultados sincronizados
- **Entrenamiento Individual:** Práctica personalizada con estadísticas
- **Ranking Global:** Sistema unificado de estadísticas y progreso
- **Validación Inteligente:** Códigos de sala y entrada de datos
- **Branding TRIVIA WAR:** Identidad visual gaming moderna

### **🔧 Arquitectura Técnica**
- **Separación Frontend/Backend:** Desarrollo independiente
- **Componentes Reutilizables:** Navbar con ng-content projection
- **Servicios Centralizados:** Fallbacks robustos y manejo de errores
- **Base de Datos NoSQL:** Múltiples tablas con escalabilidad automática
- **IA Integrada:** Contenido dinámico con Gemini API
- **Tiempo Real:** WebSockets para multijugador con reconexión
- **Evaluación Centralizada:** Backend coordina resultados multijugador
- **Ranking Unificado:** Combinación de datos de múltiples fuentes

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
- **`mvpp-estadisticas`** - Estadísticas acumuladas por usuario (emails como userId)
- **`mvpp-resultados-partida`** - Resultados individuales de partidas (UUIDs como userId)
- **`mvpp-usuarios`** - Información de usuarios registrados

### **Endpoints de la API**
- **`GET /api`** - Estado de la API
- **`POST /api/rooms`** - Crear sala
- **`GET /api/rooms/:roomCode`** - Obtener sala
- **`POST /api/rooms/:roomCode/join`** - Unirse a sala
- **`POST /api/games/generate-questions`** - Generar cuestionario mixto
- **`POST /api/games/save-result`** - Guardar resultado individual
- **`POST /api/games/submit-result`** - Enviar resultado multijugador
- **`GET /api/estadisticas/:userId`** - Estadísticas personales
- **`GET /api/estadisticas/ranking`** - Ranking global unificado

## 📱 Flujo de Usuario

### **1. Autenticación**
```
Splash (12s) → Login → Registro/Confirmación → Dashboard
```

### **2. Modo Multijugador**
```
Dashboard → Crear Sala → ConfigurarSala → Lobby → Arena → Resultados
Dashboard → Unirse Sala → ConfigurarSala → Lobby → Arena → Resultados
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

# Terminal 2 - Backend (conecta a DynamoDB en NAS)
cd backend && npm install && npm run dev
```

### **Producción (AWS)**
- **Frontend:** AWS App Runner (Angular)
- **Backend:** AWS App Runner (Express)
- **Base de Datos:** AWS DynamoDB
- **Autenticación:** AWS Cognito
- **IA:** Google Gemini API

---

## 🎯 Características Avanzadas Implementadas

### **🎨 Sistema de Navegación Neon**
- **Navbar Unificada:** Componente reutilizable que elimina duplicación de código
- **Efectos Neon:** Navegación con text-shadow y glow effects sin fondos
- **Sidebar Estadísticas:** Panel expandible con datos de usuario en tiempo real
- **Responsive Design:** Adaptable a diferentes tamaños de pantalla

### **🏆 Sistema de Ranking Avanzado**
- **Datos Unificados:** Combina estadísticas de entrenamientos y partidas multijugador
- **Normalización por Username:** Consistencia en identificación de usuarios
- **Múltiples Fuentes:** mvpp-estadisticas + mvpp-resultados-partida
- **Ranking en Tiempo Real:** Actualización automática de posiciones

### **🎮 Multijugador Sincronizado**
- **Evaluación Centralizada:** Backend determina ganadores con criterios consistentes
- **Resultados 4-Cuadrantes:** Winner, Match Ranking, Personal Performance, Global Ranking
- **Coordinación en Tiempo Real:** WebSocket para sincronización de estados
- **Persistencia Dual:** Resultados individuales + estadísticas acumuladas

### **✅ Validación y UX**
- **Códigos de Sala:** Formato 6 caracteres alfanuméricos con validación
- **Estados de Botones:** Copy buttons con feedback visual (normal → copied)
- **Flujo Optimizado:** Prevención de acciones prematuras en configuración
- **Manejo de Errores:** Mensajes informativos y fallbacks robustos

### **⚡ Optimizaciones de Rendimiento**
- **Componentes Standalone:** Angular 20 con arquitectura moderna
- **Signals Reactivos:** Estado reactivo para autenticación y datos
- **Lazy Loading:** Carga diferida de componentes
- **SCSS Variables:** Sistema de theming centralizado y consistente

---

**TRIVIA WAR** - Una experiencia de trivia gaming moderna con IA, multijugador sincronizado en tiempo real y diseño neon innovador. 🎮✨
