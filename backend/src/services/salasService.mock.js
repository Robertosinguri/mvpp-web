// =======================
// SalasService Mock para Testing
// =======================

const TABLA_SALAS = 'mvpp-salas';

// Mock de salas en memoria para testing
let salasMock = [];

// Crear nueva sala
const crearSala = async (salaData) => {
  const sala = {
    id: generateRoomCode(),
    ...salaData,
    fechaCreacion: new Date().toISOString(),
    estado: 'esperando',
    jugadores: []
  };
  
  // Simular guardado en "base de datos"
  salasMock.push(sala);
  console.log('Sala creada:', sala.id);
  
  return sala;
};

// Obtener sala por código
const obtenerSala = async (roomCode) => {
  const sala = salasMock.find(s => s.id === roomCode);
  console.log('Buscando sala:', roomCode, sala ? 'encontrada' : 'no encontrada');
  return sala;
};

// Unirse a sala
const unirseASala = async (roomCode, jugador) => {
  const salaIndex = salasMock.findIndex(s => s.id === roomCode);
  if (salaIndex === -1) {
    throw new Error('Sala no encontrada');
  }
  
  salasMock[salaIndex].jugadores.push(jugador);
  console.log('Jugador agregado a sala:', roomCode, jugador);
  
  return salasMock[salaIndex];
};

// Generar código de sala
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Función para limpiar datos de prueba
const limpiarDatos = () => {
  salasMock = [];
  console.log('Datos de prueba limpiados');
};

// Función para obtener todas las salas (para debugging)
const obtenerTodasLasSalas = () => {
  return salasMock;
};

module.exports = {
  crearSala,
  obtenerSala,
  unirseASala,
  limpiarDatos,
  obtenerTodasLasSalas
};
