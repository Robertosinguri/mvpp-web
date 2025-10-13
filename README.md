# MVPP Web - Trivia Game 🎮

> ⚠️ **PROYECTO EN DESARROLLO ACTIVO** - Funcionalidades en construcción

**Aplicación web de trivia multijugador** desarrollada con Angular 20 e integración de IA para generación dinámica de preguntas.

## 🎯 Estado Actual del Desarrollo

### ✅ **Funcionalidades Completadas**
- **Sistema de autenticación** con AWS Cognito
- **Dashboard principal** con opciones de juego
- **Configuración de salas** con validación de temáticas
- **Modo entrenamiento** individual funcional
- **Generación de preguntas con IA** (Gemini API)
- **Motor de juego completo** con timer y puntuación
- **Interfaz responsive** optimizada

### 🚧 **En Desarrollo**
- Sistema multijugador en tiempo real
- Backend con WebSockets
- Estadísticas de usuario
- Sistema de ranking
- Notificaciones push

## 🛠️ Stack Tecnológico

- **Angular 20.3.0** - Framework frontend
- **TypeScript 5.9** - Lenguaje principal
- **AWS Cognito** - Autenticación
- **Google Gemini AI** - Generación de preguntas
- **SCSS** - Estilos optimizados
- **Angular SSR** - Server-Side Rendering

## 📁 Estructura Actualizada

```
src/app/
├── componentes/
│   ├── splash/                 # Pantalla inicial
│   ├── login/                  # Autenticación
│   ├── dashboard/              # Menú principal
│   ├── configurar-sala/        # Configuración de partidas
│   ├── entrenamiento/          # Modo individual
│   ├── lobby/                  # Sala de espera (mockup)
│   ├── juego/                  # Motor de juego
│   └── gaming-neon-background/ # Fondo animado
├── servicios/
│   ├── cognitoAuth/           # Servicio de autenticación
│   └── gemini/                # Integración con IA
├── theme/
│   └── variables.scss         # Variables globales
└── app.routes.ts             # Rutas de la aplicación
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- Angular CLI 20+
- Cuenta AWS (para Cognito)
- API Key de Google Gemini

### Setup del Proyecto

```bash
# Clonar repositorio
git clone <repository-url>
cd mvpp-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve --open
```

**URL de desarrollo:** `http://localhost:4200/`

### Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción  
npm test           # Ejecutar tests
npm run serve:ssr  # Servidor SSR
```

## 🎮 Funcionalidades Implementadas

### 🔐 **Autenticación**
- Login con AWS Cognito
- Manejo de sesiones
- Validación en tiempo real
- Mensajes de error en español

### 🏠 **Dashboard**
- Crear sala de juego
- Unirse a sala existente
- Modo entrenamiento individual
- Navegación intuitiva

### ⚙️ **Configuración de Juego**
- Selección de temática (máximo 3 palabras)
- Niveles de dificultad: Baby 🍼, Conocedor 🧠, Killer 💀
- Validación en tiempo real
- Configuración de jugadores (2-8)

### 🤖 **Generación de Preguntas con IA**
- Integración con Google Gemini AI
- Preguntas contextuales por temática
- Diferentes niveles de dificultad
- Sistema de fallback robusto
- Timeout de 15 segundos

### 🎯 **Motor de Juego**
- Timer de 30 segundos por pregunta
- Sistema de puntuación
- Feedback inmediato de respuestas
- Pantalla de resultados completa
- Opción de jugar de nuevo

## 🎨 Características Técnicas

### **Arquitectura**
- Componentes standalone de Angular
- Servicios inyectables optimizados
- Routing modular
- Change Detection optimizada

### **Estilos**
- Variables SCSS centralizadas
- Mixins reutilizables
- Diseño responsive mobile-first
- Tema gaming con efectos neón

### **Integración de APIs**
- AWS Cognito para autenticación
- Google Gemini AI para preguntas
- Manejo robusto de errores
- Timeouts configurables

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```typescript
// Configurar en servicios correspondientes
AWS_COGNITO_USER_POOL_ID = 'tu-user-pool-id'
AWS_COGNITO_CLIENT_ID = 'tu-client-id'
GEMINI_API_KEY = 'tu-gemini-api-key'
```

## 🚧 Roadmap de Desarrollo

### **Próximas Funcionalidades**
- [ ] Sistema multijugador en tiempo real
- [ ] Backend con Express.js
- [ ] WebSockets para comunicación
- [ ] Base de datos de estadísticas
- [ ] Sistema de ranking global
- [ ] Notificaciones push
- [ ] Modo torneo
- [ ] Personalización de avatares

### **Mejoras Técnicas**
- [ ] Tests unitarios completos
- [ ] CI/CD pipeline
- [ ] Monitoreo de performance
- [ ] Optimización de bundle size
- [ ] PWA capabilities

## 📈 Estado del Proyecto

**Versión Actual:** `v0.3.0-alpha`

**Última Actualización:** Diciembre 2024

**Funcionalidad Core:** ✅ Completada
**Multijugador:** 🚧 En desarrollo
**Backend:** 📋 Planificado

## 🤝 Contribución

> **Nota:** Proyecto en desarrollo activo. Las funcionalidades pueden cambiar.

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Proyecto de desarrollo para desafío grupal MVPP.

---

**🎮 MVPP Trivia Game - En construcción con ❤️**

> *"Donde la IA se encuentra con la diversión multijugador"*
