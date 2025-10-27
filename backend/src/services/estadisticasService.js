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

// Obtener estadísticas personales unificadas
const obtenerEstadisticasPersonales = async (userId, username) => {
  try {
    console.log('📊 Obteniendo estadísticas para:', { userId, username });
    
    // Buscar en ambas tablas usando diferentes criterios
    const estadisticasViejas = await dynamoService.consultar({
      TableName: TABLA_ESTADISTICAS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    });
    
    const resultadosNuevos = await dynamoService.scan({
      TableName: 'mvpp-resultados-partida',
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: { ':username': username }
    });
    
    console.log('📊 Estadísticas viejas encontradas:', estadisticasViejas?.length || 0);
    console.log('📊 Resultados nuevos encontrados:', resultadosNuevos?.length || 0);
    
    // Combinar todos los resultados
    const todosLosResultados = [
      ...(estadisticasViejas || []),
      ...(resultadosNuevos || [])
    ];
    
    if (todosLosResultados.length === 0) {
      return {
        partidasJugadas: 0,
        mejorPuntaje: 0,
        promedio: 0,
        posicionRanking: -1,
        temasRecientes: []
      };
    }
    
    // Calcular estadísticas agregadas
    const partidasJugadas = todosLosResultados.length;
    const mejorPuntaje = Math.max(...todosLosResultados.map(p => p.puntaje || 0));
    const puntajeTotal = todosLosResultados.reduce((sum, p) => sum + (p.puntaje || 0), 0);
    const promedio = parseFloat((puntajeTotal / partidasJugadas).toFixed(2));
    
    // Obtener temas recientes
    const temasRecientes = todosLosResultados
      .filter(p => p.fecha)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5)
      .map(p => p.tematica)
      .filter(t => t);
    
    // Calcular posición en el ranking
    const ranking = await obtenerRankingGlobal();
    const posicionRanking = ranking.findIndex(jugador => 
      jugador.nombre === username || jugador.userId === username
    ) + 1;
    
    console.log('📊 Estadísticas calculadas:', {
      partidasJugadas,
      mejorPuntaje,
      promedio,
      posicionRanking
    });
    
    return {
      partidasJugadas,
      mejorPuntaje,
      promedio,
      posicionRanking: posicionRanking > 0 ? posicionRanking : -1,
      temasRecientes
    };
    
  } catch (error) {
    console.error('❌ Error en obtenerEstadisticasPersonales:', error);
    return {
      partidasJugadas: 0,
      mejorPuntaje: 0,
      promedio: 0,
      posicionRanking: -1,
      temasRecientes: []
    };
  }
};

// Obtener ranking global unificado
const obtenerRankingGlobal = async () => {
  console.log('🏆 Iniciando obtenerRankingGlobal unificado...');
  
  try {
    // 1. Obtener datos de ambas tablas
    const estadisticasViejas = await dynamoService.scan({ TableName: TABLA_ESTADISTICAS });
    const resultadosNuevos = await dynamoService.scan({ TableName: 'mvpp-resultados-partida' });
    
    console.log('📊 Estadísticas viejas:', estadisticasViejas?.length || 0);
    console.log('📊 Resultados nuevos:', resultadosNuevos?.length || 0);
    
    // 2. Crear mapeo de userId a username desde resultados nuevos
    const userIdToUsername = {};
    resultadosNuevos.forEach(r => {
      if (r.userId && r.username) {
        userIdToUsername[r.userId] = r.username;
      }
    });
    
    // 3. Agrupar por username (normalizado)
    const statsPorUsername = {};
    
    // Procesar estadísticas viejas (usar email como fallback para username)
    estadisticasViejas.forEach(partida => {
      let username = userIdToUsername[partida.userId];
      if (!username) {
        // Si es email, extraer la parte antes del @
        if (partida.userId && partida.userId.includes('@')) {
          username = partida.userId.split('@')[0];
        } else {
          username = partida.userId;
        }
      }
      
      if (!statsPorUsername[username]) {
        statsPorUsername[username] = {
          userId: username,
          nombre: username,
          puntajeTotal: 0,
          partidasJugadas: 0
        };
      }
      
      statsPorUsername[username].puntajeTotal += partida.puntaje || 0;
      statsPorUsername[username].partidasJugadas += 1;
    });
    
    // Procesar resultados nuevos
    resultadosNuevos.forEach(resultado => {
      const username = resultado.username;
      if (!username) return;
      
      if (!statsPorUsername[username]) {
        statsPorUsername[username] = {
          userId: username,
          nombre: username,
          puntajeTotal: 0,
          partidasJugadas: 0
        };
      }
      
      statsPorUsername[username].puntajeTotal += resultado.puntaje || 0;
      statsPorUsername[username].partidasJugadas += 1;
    });
    
    // 4. Convertir a array y ordenar
    const rankingArray = Object.values(statsPorUsername)
      .map(jugador => ({
        ...jugador,
        promedio: parseFloat((jugador.puntajeTotal / jugador.partidasJugadas).toFixed(2))
      }))
      .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
      .map((jugador, index) => ({
        ...jugador,
        posicion: index + 1
      }));
    
    console.log('🏆 Ranking unificado generado:', rankingArray.length, 'jugadores');
    console.log('🏆 Top 3:', rankingArray.slice(0, 3));
    
    return rankingArray;
    
  } catch (error) {
    console.error('❌ Error en obtenerRankingGlobal:', error);
    return [];
  }
};

module.exports = {
  guardarResultado,
  obtenerEstadisticasPersonales,
  obtenerRankingGlobal
};