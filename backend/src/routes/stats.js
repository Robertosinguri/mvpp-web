const express = require('express');
const estadisticasService = require('../services/estadisticasService');

const router = express.Router();

// GET /api/estadisticas/ranking - ranking global
router.get('/ranking', async (req, res) => {
  try {
    const ranking = await estadisticasService.obtenerRankingGlobal();
    res.json(ranking);
  } catch (error) {
    console.error('Error en la ruta /ranking:', error);
    res.status(500).json({ error: 'Error obteniendo el ranking global' });
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

// POST /api/estadisticas/resultado - guardar resultado de partida
router.post('/resultado', async (req, res) => {
  try {
    const resultado = await estadisticasService.guardarResultado(req.body.userId, req.body);
    res.json({ success: true, resultado });
  } catch (error) {
    console.error('Error guardando resultado:', error);
    res.status(500).json({ success: false, error: 'Error guardando resultado' });
  }
});

// GET /api/estadisticas/debug - endpoint para verificar datos
router.get('/debug/datos', async (req, res) => {
  try {
    const dynamoService = require('../services/dynamoService');
    const scanParams = { TableName: 'mvpp-estadisticas' };
    const datos = await dynamoService.scan(scanParams);
    
    res.json({
      totalRegistros: datos?.length || 0,
      datos: datos || [],
      mensaje: datos?.length > 0 ? 'Hay datos en la base' : 'No hay datos en la base'
    });
  } catch (error) {
    console.error('Error en debug:', error);
    res.status(500).json({ error: 'Error obteniendo datos de debug', details: error.message });
  }
});

// GET /api/estadisticas/:userId - estadisticas personales
// ESTA RUTA DEBE IR AL FINAL para no interferir con /ranking
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.query; // Pasar username como query parameter
    
    console.log('📊 Endpoint estadisticas llamado:', { userId, username });
    
    const estadisticas = await estadisticasService.obtenerEstadisticasPersonales(userId, username);
    res.json(estadisticas);
  } catch (error) {
    console.error('❌ Error en endpoint estadisticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadisticas' });
  }
});

module.exports = router;