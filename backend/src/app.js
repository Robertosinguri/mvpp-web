// =======================
// Configuración Express y Socket.IO
// =======================
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

app.use(cors()); // Perfecto para desarrollo
app.use(express.json());

// Hacer io disponible para las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', require('./routes')); // rutas REST

// =======================
// Lógica de WebSocket
// =======================
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', ({ roomCode, userId }) => {
    socket.join(roomCode);
    socket.to(roomCode).emit('user-joined', { userId });
  });

  socket.on('leave-room', ({ roomCode, userId }) => {
    socket.leave(roomCode);
    socket.to(roomCode).emit('user-left', { userId });
  });

  socket.on('user-configured', ({ roomCode, userId }) => {
    socket.to(roomCode).emit('user-configured', { userId });
  });

  socket.on('start-game', ({ roomCode, gameData }) => {
    socket.to(roomCode).emit('game-started', { gameData });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// =======================
// Inicio del servidor
// =======================
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor de MVPP WEB corriendo en puerto ${PORT}`);
});
