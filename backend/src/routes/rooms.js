const express = require('express');
const salasService = require('../services/salasService');

const router = express.Router();

// POST /api/rooms - Crear sala
router.post('/', async (req, res) => {
  try {
    const sala = await salasService.crearSala(req.body);
    res.json({
      success: true,
      roomCode: sala.id,
      sala
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creando sala' });
  }
});

// GET /api/rooms/:roomCode - Obtener información de sala
router.get('/:roomCode', async (req, res) => {
  try {
    const sala = await salasService.obtenerSala(req.params.roomCode);
    if (!sala) {
      return res.status(404).json({ error: 'Sala no encontrada' });
    }
    res.json(sala);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo sala' });
  }
});

// POST /api/rooms/:roomCode/join - Unirse a sala
router.post('/:roomCode/join', async (req, res) => {
  try {
    const salaActualizada = await salasService.unirseASala(req.params.roomCode, req.body);
    res.json({
      success: true,
      sala: salaActualizada
    });
  } catch (error) {
    res.status(500).json({ error: 'Error uniéndose a sala' });
  }
});

module.exports = router;