const dynamoService = require('./dynamoService');

(async () => {
  try {
    // Prueba 1: Crear sala
    const sala = {
      id: 'PRUEBA123',
      nombre: 'Sala de Test',
      estado: 'esperando',
      fechaCreacion: new Date().toISOString(),
      jugadores: []
    };

    await dynamoService.crear('mvpp-salas', sala);
    console.log('✅ Sala creada:', sala);

    // Prueba 2: Obtener sala
    const result = await dynamoService.obtenerPorId('mvpp-salas', { id: 'PRUEBA123' });
    console.log('📦 Sala recuperada:', result);
  } catch (err) {
    console.error('❌ Error de prueba:', err);
  }
})();
