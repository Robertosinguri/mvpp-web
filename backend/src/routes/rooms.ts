import express from 'express';

const router = express.Router();

// POST /api/rooms - Crear sala
router.post('/', (req, res) => {
  const { hostId, maxPlayers, tema, dificultad } = req.body;
  
  // TODO: Implementar lógica con DynamoDB
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  res.json({
    success: true,
    roomCode,
    message: 'Sala creada exitosamente'
  });
});

// GET /api/rooms/:roomCode - Obtener información de sala
router.get('/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  
  // TODO: Buscar en DynamoDB
  res.json({
    roomCode,
    status: 'waiting',
    players: [],
    maxPlayers: 4
  });
});

// POST /api/rooms/:roomCode/join - Unirse a sala
router.post('/:roomCode/join', (req, res) => {
  const { roomCode } = req.params;
  const { userId, tema, dificultad } = req.body;
  
  // TODO: Agregar jugador a DynamoDB
  res.json({
    success: true,
    message: `Te uniste a la sala ${roomCode}`
  });
});

export default router;