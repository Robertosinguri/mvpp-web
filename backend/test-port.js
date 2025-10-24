const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ 
    message: 'MVPP API funcionando (PRUEBA PUERTO)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    port: 3001
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 Servidor de prueba en puerto', PORT);
  console.log('📡 API disponible en: http://localhost:' + PORT + '/api');
  console.log('✅ Prueba de puerto funcionando');
});
