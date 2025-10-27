const estadisticasService = require('./src/services/estadisticasService');

(async () => {
  try {
    console.log('=== PROBANDO RANKING UNIFICADO ===');
    const ranking = await estadisticasService.obtenerRankingGlobal();
    
    console.log('\n📊 RANKING UNIFICADO:');
    ranking.forEach((jugador, index) => {
      console.log(`${index + 1}. ${jugador.nombre} - ${jugador.puntajeTotal} puntos (${jugador.partidasJugadas} partidas)`);
    });
    
    console.log('\n=== PROBANDO ESTADÍSTICAS PERSONALES ===');
    const statsRoberto = await estadisticasService.obtenerEstadisticasPersonales('robertosinguri@gmail.com', 'Roberto');
    console.log('Estadísticas Roberto:', statsRoberto);
    
    const statsRoberto2 = await estadisticasService.obtenerEstadisticasPersonales('mvppweb@gmail.com', 'roberto2');
    console.log('Estadísticas roberto2:', statsRoberto2);
    
  } catch (error) {
    console.error('Error:', error);
  }
})();