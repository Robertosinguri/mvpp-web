const dynamoService = require('./dynamoService');

const TABLA_SALAS = 'mvpp-salas';

// Crear nueva sala
const crearSala = async (salaData) => {
  const hostPlayer = {
    id: salaData.host.id,
    nombre: salaData.host.nombre,
    esHost: true,
    configurado: !!(salaData.host.tematica && salaData.host.dificultad),
    tematica: salaData.host.tematica || undefined,
    dificultad: salaData.host.dificultad || undefined
  };

  const sala = {
    id: salaData.id || generateRoomCode(), // Usar ID proporcionado o generar uno
    nombre: salaData.nombre,
    maxJugadores: salaData.maxJugadores,
    fechaCreacion: new Date().toISOString(),
    estado: 'esperando',
    jugadores: [hostPlayer]
  };
  
  await dynamoService.crear(TABLA_SALAS, sala);
  return sala;
};

// Obtener sala por código
const obtenerSala = async (roomCode) => {
  return await dynamoService.obtenerPorId(TABLA_SALAS, { id: roomCode });
};

// Unirse a sala
const unirseASala = async (roomCode, jugadorData) => {
  // Obtener sala actual
  const sala = await obtenerSala(roomCode);
  if (!sala) {
    throw new Error('Sala no encontrada');
  }

  // Validar capacidad
  if (sala.jugadores.length >= sala.maxJugadores) {
    throw new Error('Sala llena');
  }

  // Validar que el jugador no esté ya en la sala
  if (sala.jugadores.some(j => j.id === jugadorData.id)) {
    throw new Error('Jugador ya está en la sala');
  }

  const nuevoJugador = {
    id: jugadorData.id,
    nombre: jugadorData.nombre,
    esHost: false,
    configurado: !!(jugadorData.tematica && jugadorData.dificultad),
    tematica: jugadorData.tematica || undefined,
    dificultad: jugadorData.dificultad || undefined
  };

  return await dynamoService.actualizar(
    TABLA_SALAS,
    { id: roomCode },
    'SET jugadores = list_append(jugadores, :jugador)',
    { ':jugador': [nuevoJugador] }
  );
};

// Generar código de sala
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Salir de sala
const salirDeSala = async (roomCode, userId) => {
  const sala = await obtenerSala(roomCode);
  if (!sala) {
    throw new Error('Sala no encontrada');
  }

  const jugadorIndex = sala.jugadores.findIndex(j => j.id === userId);
  if (jugadorIndex === -1) {
    throw new Error('Jugador no está en la sala');
  }

  // Si es el host y hay otros jugadores, transferir host
  const esHost = sala.jugadores[jugadorIndex].esHost;
  if (esHost && sala.jugadores.length > 1) {
    sala.jugadores[1].esHost = true; // El segundo jugador se convierte en host
  }

  sala.jugadores.splice(jugadorIndex, 1);

  // Si no quedan jugadores, eliminar sala
  if (sala.jugadores.length === 0) {
    await dynamoService.borrar(TABLA_SALAS, { id: roomCode });
    return null;
  }

  return await dynamoService.actualizar(
    TABLA_SALAS,
    { id: roomCode },
    'SET jugadores = :jugadores',
    { ':jugadores': sala.jugadores }
  );
};

// Configurar jugador
const configurarJugador = async (roomCode, userId, configuracion) => {
  const sala = await obtenerSala(roomCode);
  if (!sala) {
    throw new Error('Sala no encontrada');
  }

  const jugadorIndex = sala.jugadores.findIndex(j => j.id === userId);
  if (jugadorIndex === -1) {
    throw new Error('Jugador no está en la sala');
  }

  sala.jugadores[jugadorIndex] = {
    ...sala.jugadores[jugadorIndex],
    tematica: configuracion.tematica,
    dificultad: configuracion.dificultad,
    configurado: true
  };

  return await dynamoService.actualizar(
    TABLA_SALAS,
    { id: roomCode },
    'SET jugadores = :jugadores',
    { ':jugadores': sala.jugadores }
  );
};

module.exports = {
  crearSala,
  obtenerSala,
  unirseASala,
  salirDeSala,
  configurarJugador
};