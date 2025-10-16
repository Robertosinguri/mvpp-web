import express from 'express';

const router = express.Router();

// POST /api/games/start - Iniciar juego
router.post('/start', (req, res) => {
  const { roomCode, tematicas } = req.body;
  
  // TODO: Generar preguntas con Gemini
  res.json({
    success: true,
    sessionId: 'game_' + Date.now(),
    message: 'Juego iniciado'
  });
});

// POST /api/games/save-result - Guardar resultado
router.post('/save-result', (req, res) => {
  const { userId, sessionId, score, answers } = req.body;
  
  // TODO: Guardar en DynamoDB
  res.json({
    success: true,
    message: 'Resultado guardado'
  });
});

// GET /api/games/session/:sessionId - Obtener sesión de juego
router.get('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  // TODO: Buscar en DynamoDB
  res.json({
    sessionId,
    status: 'active',
    questions: []
  });
});

export default router;