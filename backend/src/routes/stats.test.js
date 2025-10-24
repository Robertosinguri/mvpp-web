const express = require('express');
const estadisticasService = require('../services/estadisticasService.mock');

const router = express.Router();

// GET /api/estadisticas/ranking - ranking global
router.get('/ranking', async (req, res) => {
  try {
    console.log('GET /api/estadisticas/ranking - Ranking global');
    const ranking = await estadisticasService.obtenerRankingGlobal();
    res.json(ranking);
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({ error: 'Error obteniendo ranking' });
  }
});

// GET /api/estadisticas/ranking/tema/:tema - Ranking por temática
router.get('/ranking/tema/:tema', async (req, res) => {
  try {
    console.log('GET /api/estadisticas/ranking/tema/:tema - Ranking por tema:', req.params.tema);
    const ranking = await estadisticasService.obtenerRankingPorTema(req.params.tema);
    res.json(ranking);
  } catch (error) {
    console.error('Error obteniendo ranking por tema:', error);
    res.status(500).json({ error: 'Error obteniendo ranking por tema' });
  }
});

// GET /api/estadisticas/progreso/:userId - Progreso parcial del usuario
router.get('/progreso/:userId', async (req, res) => {
  try {
    console.log('GET /api/estadisticas/progreso/:userId - Progreso parcial:', req.params.userId);
    const progreso = await estadisticasService.obtenerProgresoParcial(req.params.userId);
    res.json(progreso);
  } catch (error) {
    console.error('Error obteniendo progreso del usuario:', error);
    res.status(500).json({ error: 'Error obteniendo progreso del usuario' });
  }
});

// POST /api/estadisticas/resultado - guardar resultado
router.post('/resultado', async (req, res) => {
  try {
    console.log('POST /api/estadisticas/resultado - Guardar resultado:', req.body);
    const resultado = await estadisticasService.guardarResultado(req.body.userId, req.body);
    res.json({ success: true, resultado });
  } catch (error) {
    console.error('Error guardando resultado:', error);
    res.status(500).json({ error: 'Error guardando resultado' });
  }
});

// GET /api/estadisticas/:userId - estadisticas personales (DEBE IR AL FINAL)
router.get('/:userId', async (req, res) => {
  try {
    console.log('GET /api/estadisticas/:userId - Estadísticas personales:', req.params.userId);
    const estadisticas = await estadisticasService.obtenerEstadisticasPersonales(req.params.userId);
    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// GET /api/estadisticas - Obtener todas las estadísticas (para debugging)
router.get('/', async (req, res) => {
  try {
    const estadisticas = estadisticasService.obtenerTodasLasEstadisticas();
    res.json({
      success: true,
      estadisticas,
      total: estadisticas.length
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// DELETE /api/estadisticas - Limpiar datos de prueba
router.delete('/', async (req, res) => {
  try {
    estadisticasService.limpiarDatos();
    res.json({
      success: true,
      message: 'Estadísticas de prueba limpiadas'
    });
  } catch (error) {
    console.error('Error limpiando estadísticas:', error);
    res.status(500).json({ error: 'Error limpiando estadísticas' });
  }
});

module.exports = router;
