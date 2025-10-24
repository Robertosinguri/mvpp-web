// =======================
// Backend de Prueba - MVPP Web
// =======================
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());

// =======================
// Rutas de Testing
// =======================
const roomsTestRouter = require('./routes/rooms.test');
const gamesTestRouter = require('./routes/games.test');
const statsTestRouter = require('./routes/stats.test');

// Montar rutas de testing
app.use('/api/rooms', roomsTestRouter);
app.use('/api/games', gamesTestRouter);
app.use('/api/estadisticas', statsTestRouter);

// =======================
// Ruta principal
// =======================
app.get('/api', (req, res) => {
  res.json({ 
    message: 'MVPP API funcionando (MODO TESTING)',
    version: '1.0.0',
    mode: 'testing',
    endpoints: [
      '/api/rooms - Gestión de salas',
      '/api/games - Gestión de juegos', 
      '/api/estadisticas - Estadísticas y ranking'
    ],
    testing: {
      'GET /api/rooms': 'Listar todas las salas',
      'POST /api/rooms': 'Crear nueva sala',
      'GET /api/rooms/:roomCode': 'Obtener sala específica',
      'POST /api/rooms/:roomCode/join': 'Unirse a sala',
      'DELETE /api/rooms': 'Limpiar datos de prueba',
      'GET /api/estadisticas/ranking': 'Ranking global',
      'GET /api/estadisticas/:userId': 'Estadísticas personales',
      'POST /api/estadisticas/resultado': 'Guardar resultado',
      'DELETE /api/estadisticas': 'Limpiar estadísticas de prueba'
    }
  });
});

// =======================
// Configuración Socket.IO
// =======================
const { createServer } = require('http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

// =======================
// Lógica de WebSocket
// =======================
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', ({ roomCode, userId }) => {
    console.log('Usuario se une a sala:', { roomCode, userId, socketId: socket.id });
    socket.join(roomCode);
    socket.to(roomCode).emit('user-joined', { userId, socketId: socket.id });
  });

  socket.on('leave-room', ({ roomCode, userId }) => {
    console.log('Usuario sale de sala:', { roomCode, userId, socketId: socket.id });
    socket.leave(roomCode);
    socket.to(roomCode).emit('user-left', { userId, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// =======================
// Inicio del servidor
// =======================
const PORT = 3003;
server.listen(PORT, () => {
  console.log('🚀 Servidor de MVPP WEB (MODO TESTING) corriendo en puerto', PORT);
  console.log('📡 API disponible en: http://localhost:' + PORT + '/api');
  console.log('🔌 WebSocket disponible en: http://localhost:' + PORT);
  console.log('🧪 Modo: TESTING (sin DynamoDB)');
  console.log('');
  console.log('📋 Endpoints de prueba disponibles:');
  console.log('  GET  /api - Información de la API');
  console.log('  GET  /api/rooms - Listar salas');
  console.log('  POST /api/rooms - Crear sala');
  console.log('  GET  /api/rooms/:roomCode - Obtener sala');
  console.log('  POST /api/rooms/:roomCode/join - Unirse a sala');
  console.log('  GET  /api/estadisticas/ranking - Ranking global');
  console.log('  GET  /api/estadisticas/:userId - Estadísticas personales');
  console.log('  POST /api/estadisticas/resultado - Guardar resultado');
  console.log('  POST /api/games/start - Iniciar juego');
  console.log('  POST /api/games/save-result - Guardar resultado');
  console.log('');
  console.log('🧹 Para limpiar datos de prueba:');
  console.log('  DELETE /api/rooms - Limpiar salas');
  console.log('  DELETE /api/estadisticas - Limpiar estadísticas');
});
