const express = require('express');
const dynamoService = require('../services/dynamoService');

const router = express.Router();

// POST /api/games/start - Iniciar juego
router.post('/start', (req, res) => {
  const { roomCode, tematicas } = req.body;

  // TODO: Generar preguntas con Gemini
  res.json({
    success: true,
    sessionId: 'game_' + Date.now(),
    message: 'Juego iniciado',
  });
});

// POST /api/games/save-result - Guardar resultado
router.post('/save-result', async (req, res) => {
  const { userId, sessionId, score, answers } = req.body;

  const gameResult = {
    partidaId: sessionId, // Usamos sessionId como clave de partición
    userId, // Podría ser un índice secundario para buscar por usuario
    score,
    answers,
    fecha: new Date().toISOString(),
  };

  try {
    await dynamoService.crear('mvpp-estadisticas', gameResult);
    res.status(201).json({ success: true, message: 'Resultado guardado con éxito' });
  } catch (error) {
    console.error('Error al guardar el resultado del juego:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/games/session/:sessionId - Obtener sesión de juego
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // La clave de la tabla 'mvpp-estadisticas' es 'partidaId'
    const gameSession = await dynamoService.obtenerPorId('mvpp-estadisticas', { partidaId: sessionId });

    if (gameSession) {
      // Si se encuentra la sesión, se devuelve
      res.json({ success: true, data: gameSession });
    } else {
      // Si no se encuentra, devolvemos un error 404
      res.status(404).json({ success: false, message: 'No se encontró una sesión de juego con ese ID.' });
    }

  } catch (error) {
    console.error(`Error al obtener la sesión ${sessionId}:`, error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al buscar la sesión.' });
  }
});

module.exports = router;