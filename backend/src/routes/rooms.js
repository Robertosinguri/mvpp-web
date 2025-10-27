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
    const statusCode = error.message === 'Sala no encontrada' ? 404 :
                      error.message === 'Sala llena' ? 409 :
                      error.message === 'Jugador ya está en la sala' ? 409 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Error uniéndose a sala' 
    });
  }
});

// DELETE /api/rooms/:roomCode/leave - Salir de sala
router.delete('/:roomCode/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const salaActualizada = await salasService.salirDeSala(req.params.roomCode, userId);
    res.json({
      success: true,
      sala: salaActualizada
    });
  } catch (error) {
    const statusCode = error.message === 'Sala no encontrada' ? 404 :
                      error.message === 'Jugador no está en la sala' ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Error saliendo de sala' 
    });
  }
});

// PUT /api/rooms/:roomCode/configure - Configurar jugador
router.put('/:roomCode/configure', async (req, res) => {
  try {
    const { userId, tematica, dificultad } = req.body;
    const salaActualizada = await salasService.configurarJugador(
      req.params.roomCode, 
      userId, 
      { tematica, dificultad }
    );
    res.json({
      success: true,
      sala: salaActualizada
    });
  } catch (error) {
    const statusCode = error.message === 'Sala no encontrada' ? 404 :
                      error.message === 'Jugador no está en la sala' ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      error: error.message || 'Error configurando jugador' 
    });
  }
});

module.exports = router;