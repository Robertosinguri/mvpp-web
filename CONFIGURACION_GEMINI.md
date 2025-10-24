# Configuración del Generador de Avatares con IA

## ¿Qué se implementó?

Se implementó un generador de avatares con IA que utiliza Google Cloud Imagen AI para crear avatares personalizados basados en las preferencias del usuario.

## Funcionalidades

✅ **Modal interactivo** con preguntas sobre estilo (anime, caricatura, cómic)
✅ **Preguntas específicas** según el estilo elegido
✅ **Campo de texto libre** para describir características específicas
✅ **Integración con Imagen AI** de Google Cloud
✅ **Sistema de fallback** con avatares SVG personalizados
✅ **Guardado automático** del avatar generado

## Configuración requerida

### 1. Obtener API Key de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita la **Vertex AI API**
4. Ve a "APIs y servicios" > "Credenciales"
5. Crea una nueva **API Key**
6. Copia la API Key generada

### 2. Configurar las credenciales

Edita el archivo `frontend/src/app/servicios/gemini/gemini.config.ts`:

```typescript
export const geminiConfig = {
  GEMINI_API_KEY: 'TU_API_KEY_AQUI',  // ← Reemplaza esto
  PROJECT_ID: 'tu-project-id',        // ← Y esto
  // ... resto de la configuración
};
```

### 3. Verificar la configuración

1. Reinicia el servidor de desarrollo
2. Ve al dashboard
3. Haz clic en "Mi Perfil" 
4. Selecciona "✨ Generar Avatar"
5. Completa las preguntas
6. El avatar se generará automáticamente

## Funcionamiento actual

**Con API configurada:** Genera avatares reales usando IA
**Sin API configurada:** Usa avatares SVG personalizados como fallback

## Archivos modificados

- `dashboard.html` - Modal del generador (ya estaba)
- `dashboard.ts` - Lógica del componente (ya estaba)
- `gemini.service.ts` - Servicio actualizado para Imagen AI
- `gemini.config.ts` - Configuración nueva
- Este archivo de documentación

## Notas importantes

- El sistema funciona sin configuración (usa fallback)
- Los avatares se guardan en localStorage
- La API de Google Cloud puede tener costos asociados
- Se recomienda configurar límites de uso en Google Cloud

## Solución de problemas

**Error de API:** Verifica que la API Key y Project ID sean correctos
**Error de permisos:** Asegúrate de que Vertex AI esté habilitado
**Avatar no se genera:** Revisa la consola del navegador para errores

¡El generador de avatares con Gemini ya está listo para usar! 🎨✨