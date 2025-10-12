# MVPP Web - Desafío Grupal

🎮 **Aplicación web moderna desarrollada con Angular 20** para el desafío grupal MVPP.

## 🚀 Características

- **Splash Screen animado** con efectos neón y gaming
- **Sistema de login** con validación y estados reactivos
- **Diseño responsivo** optimizado para móviles y desktop
- **Animaciones fluidas** con CSS optimizado
- **Arquitectura moderna** con Angular Signals y componentes standalone
- **SSR habilitado** para mejor SEO y performance

## 🛠️ Tecnologías

- **Angular 20.3.0** - Framework principal
- **TypeScript 5.9** - Lenguaje de programación
- **SCSS** - Preprocesador CSS
- **Angular SSR** - Server-Side Rendering
- **Vite** - Build tool optimizado

## 📱 Estructura del Proyecto

```
src/
├── app/
│   ├── componentes/
│   │   ├── splash/              # Pantalla de bienvenida
│   │   ├── login/               # Sistema de autenticación
│   │   └── gaming-neon-background/ # Fondo animado
│   ├── theme/
│   │   └── variables.scss       # Variables globales optimizadas
│   └── app.routes.ts           # Configuración de rutas
└── styles.scss                # Estilos globales
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd mvpp-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

Navega a `http://localhost:4200/` para ver la aplicación.

## 📝 Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción
npm test           # Ejecutar tests
npm run serve:ssr  # Servidor SSR
```

## 🎯 Funcionalidades

### Splash Screen
- Animación de carga de 12 segundos
- Efectos neón y elementos gaming
- Transición automática al login
- Diseño responsivo

### Sistema de Login
- Validación en tiempo real
- Estados de carga
- Manejo de errores
- Credenciales de prueba: `admin / admin`

## 📊 Optimizaciones Realizadas

- ✅ **Variables SCSS consolidadas** y organizadas
- ✅ **Componentes optimizados** con mejor documentación
- ✅ **Animaciones CSS mejoradas** para mejor performance
- ✅ **Código duplicado eliminado**
- ✅ **Manejo de errores implementado**
- ✅ **Accesibilidad mejorada**
- ✅ **Responsive design optimizado**

## 💱 Performance

- **Lazy loading** de componentes
- **Tree shaking** automático
- **CSS optimizado** con animaciones eficientes
- **Imagenes optimizadas**
- **SSR** para carga inicial rápida

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte del desafío grupal MVPP.

---

🚀 **Desarrollado con ❤️ por el equipo MVPP**