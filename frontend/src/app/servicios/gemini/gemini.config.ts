export const geminiConfig = {
  // Configuración para Amazon Bedrock (usando tus credenciales AWS actuales)
  USE_AWS_BEDROCK: true,
  AWS_REGION: 'us-east-1', // Cambia por tu región
  
  // Modelo de generación de imágenes en Bedrock
  BEDROCK_MODEL_ID: 'stability.stable-diffusion-xl-v1',
  
  // Configuración de generación
  DEFAULT_PARAMS: {
    sampleCount: 1,
    aspectRatio: '1:1',
    safetyFilterLevel: 'block_some',
    personGeneration: 'allow_adult'
  },
  
  // Configuración de fallback
  FALLBACK_ENABLED: true,
  
  // Instrucciones para configurar
  SETUP_INSTRUCTIONS: `
    Para configurar la generación de avatares con IA:
    
    1. Obtén una API key de Google Cloud:
       - Ve a https://console.cloud.google.com/
       - Crea un proyecto o selecciona uno existente
       - Habilita la API de Vertex AI
       - Crea credenciales (API Key)
    
    2. Reemplaza YOUR_GEMINI_API_KEY_HERE con tu API key real
    3. Reemplaza YOUR_GOOGLE_CLOUD_PROJECT_ID con tu project ID
    
    Mientras tanto, el sistema usará avatares SVG generados localmente.
  `
};