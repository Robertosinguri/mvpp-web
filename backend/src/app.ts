import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar rutas
import apiRoutes from './routes';

// Configurar variables de entorno
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MVPP Backend'
  });
});

// WebSocket para multijugador
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-room', (data) => {
    const { roomCode, userId } = data;
    socket.join(roomCode);
    console.log(`Usuario ${userId} se unió a sala ${roomCode}`);
    
    // Notificar a otros en la sala
    socket.to(roomCode).emit('user-joined', { userId });
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket habilitado`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;