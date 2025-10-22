const dynamoService = require('./dynamoService');

const TABLA_ESTADISTICAS = 'mvpp-estadisticas';

// Guardar resultado de partida
const guardarResultado = async (userId, resultado) => {
  const estadistica = {
    userId,
    partidaId: `${userId}-${Date.now()}`,
    ...resultado,
    fecha: new Date().toISOString()
  };
  
  await dynamoService.crear(TABLA_ESTADISTICAS, estadistica);
  return estadistica;
};

// Obtener estadísticas personales
const obtenerEstadisticasPersonales = async (userId) => {
  const command = {
    TableName: TABLA_ESTADISTICAS,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  };
  return await dynamoService.consultar(command);
};

// Obtener ranking global (top 10)
const obtenerRankingGlobal = async () => {
  // Implementar lógica de ranking
  // Por ahora retorna mock data
  return [
    { userId: 'user1', puntuacion: 1500, partidas: 25 },
    { userId: 'user2', puntuacion: 1200, partidas: 18 }
  ];
};

module.exports = {
  guardarResultado,
  obtenerEstadisticasPersonales,
  obtenerRankingGlobal
};