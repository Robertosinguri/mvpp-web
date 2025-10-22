const dynamoService = require('./dynamoService');

const TABLA_SALAS = 'mvpp-salas';

// Crear nueva sala
const crearSala = async (salaData) => {
  const sala = {
    id: generateRoomCode(),
    ...salaData,
    fechaCreacion: new Date().toISOString(),
    estado: 'esperando',
    jugadores: []
  };
  
  await dynamoService.crear(TABLA_SALAS, sala);
  return sala;
};

// Obtener sala por código
const obtenerSala = async (roomCode) => {
  return await dynamoService.obtenerPorId(TABLA_SALAS, { id: roomCode });
};

// Unirse a sala
const unirseASala = async (roomCode, jugador) => {
  return await dynamoService.actualizar(
    TABLA_SALAS,
    { id: roomCode },
    'SET jugadores = list_append(jugadores, :jugador)',
    { ':jugador': [jugador] }
  );
};

// Generar código de sala
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = {
  crearSala,
  obtenerSala,
  unirseASala
};