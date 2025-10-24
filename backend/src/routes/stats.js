const express = require('express');
const estadisticasService = require('../services/estadisticasService');

const router = express.Router();

// GET /api/estadisticas/:userId - estadisticas personales
router.get('/:userId', async (req, res) => {
  try {
    const estadisticas = await estadisticasService.obtenerEstadisticasPersonales(req.params.userId);
    res.json(estadisticas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo estadisticas' });
  }
});

// GET /api/estadisticas/ranking - ranking global
// Nota: La lógica para esto en el servicio es un mock.
router.get('/ranking', async (req, res) => {
  try {
    // TODO: Implementar la lógica real en estadisticasService.js
    const ranking = await estadisticasService.obtenerRankingGlobal();
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Error guardando ranking' });
  }
});

// GET /api/estadisticas/ranking/tema/:tema - Ranking por temática
router.get('/ranking/tema/:tema', async (req, res) => {
  // TODO: Implementar la lógica en estadisticasService.js
  try {
    const ranking = await estadisticasService.obtenerRankingPorTema(req.params.tema);
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo ranking por tema' });
  }
});

// GET /api/estadisticas/progreso/:userId - Progreso parcial del usuario
router.get('/progreso/:userId', async (req, res) => {
  // TODO: Implementar la lógica en estadisticasService.js
  try {
    const progreso = await estadisticasService.obtenerProgresoParcial(req.params.userId);
    res.json(progreso);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo progreso del usuario' });
  }
});

module.exports = router;