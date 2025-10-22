const express = require('express');
const router = express.Router();

const roomsRouter = require('./rooms');
const gamesRouter = require('./games');
const estadisticasRouter = require('./stats');


// Montar sub-routers
router.use('/rooms', roomsRouter);
router.use('/games', gamesRouter);
router.use('/estadisticas', estadisticasRouter);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ 
    message: 'MVPP API funcionando',
    version: '1.0.0',
    endpoints: ['/rooms', '/games', '/estadisticas']
  });
});

module.exports = router;