const express = require('express');
const salasService = require('../services/salasService.mock');

const router = express.Router();

// POST /api/rooms - Crear sala
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/rooms - Crear sala:', req.body);
    const sala = await salasService.crearSala(req.body);
    res.json({
      success: true,
      roomCode: sala.id,
      sala
    });
  } catch (error) {
    console.error('Error creando sala:', error);
    res.status(500).json({ error: 'Error creando sala' });
  }
});

// GET /api/rooms/:roomCode - Obtener información de sala
router.get('/:roomCode', async (req, res) => {
  try {
    console.log('GET /api/rooms/:roomCode - Obtener sala:', req.params.roomCode);
    const sala = await salasService.obtenerSala(req.params.roomCode);
    if (!sala) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.json(sala);
  } catch (error) {
    console.error('Error obteniendo sala:', error);
    res.status(500).json({ error: 'Error obteniendo sala' });
  }
});

// POST /api/rooms/:roomCode/join - Unirse a sala
router.post('/:roomCode/join', async (req, res) => {
  try {
    console.log('POST /api/rooms/:roomCode/join - Unirse a sala:', req.params.roomCode, req.body);
    const salaActualizada = await salasService.unirseASala(req.params.roomCode, req.body);
    res.json({
      success: true,
      sala: salaActualizada
    });
  } catch (error) {
    console.error('Error uniéndose a sala:', error);
    res.status(500).json({ error: 'Error uniéndose a sala' });
  }
});

// GET /api/rooms - Obtener todas las salas (para debugging)
router.get('/', async (req, res) => {
  try {
    const salas = salasService.obtenerTodasLasSalas();
    res.json({
      success: true,
      salas,
      total: salas.length
    });
  } catch (error) {
    console.error('Error obteniendo salas:', error);
    res.status(500).json({ error: 'Error obteniendo salas' });
  }
});

// DELETE /api/rooms - Limpiar datos de prueba
router.delete('/', async (req, res) => {
  try {
    salasService.limpiarDatos();
    res.json({
      success: true,
      message: 'Datos de prueba limpiados'
    });
  } catch (error) {
    console.error('Error limpiando datos:', error);
    res.status(500).json({ error: 'Error limpiando datos' });
  }
});

module.exports = router;
