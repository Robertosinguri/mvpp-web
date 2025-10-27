const dynamoService = require('./src/services/dynamoService');

(async () => {
  try {
    console.log('=== TABLA mvpp-estadisticas ===');
    const stats = await dynamoService.scan({ TableName: 'mvpp-estadisticas' });
    console.log('Total registros:', stats.length);
    stats.slice(0, 5).forEach(s => {
      console.log(`- userId: "${s.userId}", puntaje: ${s.puntaje}, fecha: ${s.fecha}`);
    });
    
    console.log('\n=== TABLA mvpp-resultados-partida ===');
    const results = await dynamoService.scan({ TableName: 'mvpp-resultados-partida' });
    console.log('Total registros:', results.length);
    results.slice(0, 5).forEach(r => {
      console.log(`- userId: "${r.userId}", username: "${r.username}", puntaje: ${r.puntaje}`);
    });
    
    // Analizar inconsistencias
    console.log('\n=== ANÁLISIS DE INCONSISTENCIAS ===');
    const userIds = new Set();
    const usernames = new Set();
    
    stats.forEach(s => userIds.add(s.userId));
    results.forEach(r => {
      userIds.add(r.userId);
      usernames.add(r.username);
    });
    
    console.log('UserIds únicos:', Array.from(userIds));
    console.log('Usernames únicos:', Array.from(usernames));
    
  } catch (error) {
    console.error('Error:', error);
  }
})();