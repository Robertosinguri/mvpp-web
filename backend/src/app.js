// =======================
// Configuración Express
// =======================
const express = require('express');
const app = express();

const cors = require('cors');
// Para producción, es mejor ser explícito con el origen.
// const corsOptions = {
//   origin: 'https://tu-dominio-del-frontend.com'
// };
// app.use(cors(corsOptions));

app.use(cors()); // Perfecto para desarrollo

app.use(express.json());
app.use('/api', require('./routes')); // rutas REST

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
    socket.join(roomCode);
    socket.to(roomCode).emit('user-joined', { userId });
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
