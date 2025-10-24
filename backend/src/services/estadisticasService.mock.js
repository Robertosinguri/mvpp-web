// =======================
// EstadisticasService Mock para Testing
// =======================

const TABLA_ESTADISTICAS = 'mvpp-estadisticas';

// Mock de estadísticas en memoria para testing
let estadisticasMock = [];

// Guardar resultado de partida
const guardarResultado = async (userId, resultado) => {
  const estadistica = {
    userId,
    partidaId: `${userId}-${Date.now()}`,
    ...resultado,
    fecha: new Date().toISOString()
  };
  
  estadisticasMock.push(estadistica);
  console.log('Resultado guardado:', estadistica.partidaId);
  
  return estadistica;
};

// Obtener estadísticas personales
const obtenerEstadisticasPersonales = async (userId) => {
  const estadisticas = estadisticasMock.filter(e => e.userId === userId);
  console.log('Estadísticas personales para:', userId, estadisticas.length, 'registros');
  return estadisticas;
};

// Obtener ranking global (top 10)
const obtenerRankingGlobal = async () => {
  // Simular ranking basado en puntuaciones
  const ranking = [
    { userId: 'user1', nombre: 'Jugador 1', puntuacion: 1500, partidas: 25, promedio: 60 },
    { userId: 'user2', nombre: 'Jugador 2', puntuacion: 1200, partidas: 18, promedio: 66.7 },
    { userId: 'user3', nombre: 'Jugador 3', puntuacion: 1000, partidas: 15, promedio: 66.7 },
    { userId: 'user4', nombre: 'Jugador 4', puntuacion: 800, partidas: 12, promedio: 66.7 },
    { userId: 'user5', nombre: 'Jugador 5', puntuacion: 600, partidas: 10, promedio: 60 }
  ];
  
  console.log('Ranking global obtenido:', ranking.length, 'jugadores');
  return ranking;
};

// Obtener ranking por tema
const obtenerRankingPorTema = async (tema) => {
  const ranking = [
    { userId: 'user1', nombre: 'Jugador 1', puntuacion: 800, partidas: 10, tema },
    { userId: 'user2', nombre: 'Jugador 2', puntuacion: 600, partidas: 8, tema },
    { userId: 'user3', nombre: 'Jugador 3', puntuacion: 400, partidas: 6, tema }
  ];
  
  console.log('Ranking por tema:', tema, ranking.length, 'jugadores');
  return ranking;
};

// Obtener progreso parcial del usuario
const obtenerProgresoParcial = async (userId) => {
  const progreso = {
    puntajeTotal: 1200,
    partidasHoy: 3,
    mejorRacha: 5,
    rachaActual: 2,
    temaMasFuerte: 'deportes'
  };
  
  console.log('Progreso parcial para:', userId);
  return progreso;
};

// Función para limpiar datos de prueba
const limpiarDatos = () => {
  estadisticasMock = [];
  console.log('Estadísticas de prueba limpiadas');
};

// Función para obtener todas las estadísticas (para debugging)
const obtenerTodasLasEstadisticas = () => {
  return estadisticasMock;
};

module.exports = {
  guardarResultado,
  obtenerEstadisticasPersonales,
  obtenerRankingGlobal,
  obtenerRankingPorTema,
  obtenerProgresoParcial,
  limpiarDatos,
  obtenerTodasLasEstadisticas
};
