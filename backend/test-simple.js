const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ 
    message: 'MVPP API funcionando (PRUEBA SIMPLE)',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/rooms', (req, res) => {
  res.json({
    success: true,
    salas: [],
    total: 0,
    message: 'Lista de salas vacía (modo prueba)'
  });
});

app.post('/api/rooms', (req, res) => {
  const sala = {
    id: 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    ...req.body,
    fechaCreacion: new Date().toISOString(),
    estado: 'esperando',
    jugadores: []
  };
  
  res.json({
    success: true,
    roomCode: sala.id,
    sala
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('🚀 Servidor de prueba simple corriendo en puerto', PORT);
  console.log('📡 API disponible en: http://localhost:3000/api');
  console.log('✅ Prueba básica funcionando');
});
