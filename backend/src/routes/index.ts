import express from 'express';
import roomsRouter from './rooms';
import gamesRouter from './games';
import statsRouter from './stats';

const router = express.Router();

// Montar sub-routers
router.use('/rooms', roomsRouter);
router.use('/games', gamesRouter);
router.use('/stats', statsRouter);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ 
    message: 'MVPP API funcionando',
    version: '1.0.0',
    endpoints: ['/rooms', '/games', '/stats']
  });
});

export default router;