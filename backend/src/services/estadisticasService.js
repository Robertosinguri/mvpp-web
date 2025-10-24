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
  // 1. Escanear toda la tabla de estadísticas.
  // NOTA: Para una aplicación a gran escala, un 'scan' es ineficiente.
  // Se debería usar un enfoque más avanzado como un Índice Secundario Global (GSI)
  // o pre-calcular los rankings con AWS Lambda. Para este proyecto, un 'scan' es suficiente.
  const scanParams = { TableName: TABLA_ESTADISTICAS };
  const todasLasPartidas = await dynamoService.consultar(scanParams);

  if (!todasLasPartidas || todasLasPartidas.length === 0) {
    return [];
  }

  // 2. Agrupar resultados por usuario y calcular estadísticas
  const statsPorUsuario = todasLasPartidas.reduce((acc, partida) => {
    const userId = partida.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userId: userId,
        nombre: partida.nombre || userId, // Asumimos que el nombre viene en la partida
        puntajeTotal: 0,
        partidasJugadas: 0,
      };
    }
    acc[userId].puntajeTotal += partida.score || 0;
    acc[userId].partidasJugadas += 1;
    return acc;
  }, {});

  // 3. Convertir el objeto a un array, calcular promedio y ordenar
  const rankingArray = Object.values(statsPorUsuario)
    .map(jugador => ({
      ...jugador,
      promedio: parseFloat((jugador.puntajeTotal / jugador.partidasJugadas).toFixed(2)),
    }))
    .sort((a, b) => b.puntajeTotal - a.puntajeTotal);

  // 4. Asignar la posición y devolver
  return rankingArray.map((jugador, index) => ({ ...jugador, posicion: index + 1 }));
};

module.exports = {
  guardarResultado,
  obtenerEstadisticasPersonales,
  obtenerRankingGlobal
};