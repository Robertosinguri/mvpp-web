const express = require('express');
const dynamoService = require('../services/dynamoService');

const router = express.Router();

// Configuración de Gemini API
const GEMINI_API_KEY = 'AIzaSyCQ0u-ZbHVG4XX97zy81ucbW_6lWt6_91s';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Función para generar preguntas con Gemini
async function generarPreguntasConIA(tematica, dificultad, cantidad = 2) {
  const nivelDescripcion = {
    'baby': 'muy fáciles, nivel principiante',
    'conocedor': 'de dificultad intermedia',
    'killer': 'muy difíciles, nivel experto'
  };

  const prompt = `Genera ${cantidad} preguntas de trivia sobre "${tematica}" que sean ${nivelDescripcion[dificultad]}.

Cada pregunta debe tener exactamente 4 opciones de respuesta y solo una correcta.

Formato JSON requerido:
[
  {
    "pregunta": "texto de la pregunta",
    "opciones": ["opción 1", "opción 2", "opción 3", "opción 4"],
    "respuestaCorrecta": índice_correcto (0-3)
  }
]

Responde SOLO con el JSON válido, sin texto adicional.`;

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Error de IA: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  const texto = data.candidates[0].content.parts[0].text;
  
  let jsonText = texto.trim();
  jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '');
  jsonText = jsonText.replace(/```\s*$/, '').replace(/\s*```.*$/, '');
  jsonText = jsonText.trim();

  return JSON.parse(jsonText);
}

// POST /api/games/generate-questions - Generar cuestionario colaborativo
router.post('/generate-questions', async (req, res) => {
  const { roomCode, tematicas, dificultad } = req.body;

  console.log('=== GENERANDO CUESTIONARIO COLABORATIVO ===');
  console.log('Room Code:', roomCode);
  console.log('Temáticas de jugadores:', tematicas);
  console.log('Dificultad:', dificultad);

  try {
    const tematicasArray = tematicas ? tematicas.split(',').filter(t => t.trim()) : [];
    
    if (tematicasArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron temáticas'
      });
    }

    console.log(`Procesando ${tematicasArray.length} temáticas:`, tematicasArray);
    
    const preguntasPorTematica = Math.ceil(5 / tematicasArray.length);
    const todasLasPreguntas = [];

    // Generar preguntas reales con IA para cada temática
    for (let i = 0; i < tematicasArray.length; i++) {
      const tematica = tematicasArray[i].trim();
      console.log(`Generando ${preguntasPorTematica} preguntas con IA sobre: ${tematica}`);
      
      try {
        const preguntasIA = await generarPreguntasConIA(tematica, dificultad, preguntasPorTematica);
        
        preguntasIA.forEach((preguntaIA, j) => {
          if (todasLasPreguntas.length < 5) {
            todasLasPreguntas.push({
              id: `${tematica.replace(/\s+/g, '_')}_${j}`,
              pregunta: preguntaIA.pregunta,
              opciones: preguntaIA.opciones,
              respuestaCorrecta: preguntaIA.respuestaCorrecta,
              tematica: tematica,
              dificultad: dificultad,
              aportadoPor: `Jugador ${i + 1}`
            });
          }
        });
      } catch (error) {
        console.error(`Error generando preguntas para ${tematica}:`, error);
        throw new Error(`No se pudieron generar preguntas para la temática "${tematica}". ${error.message}`);
      }
    }

    // Mezclar preguntas aleatoriamente
    for (let i = todasLasPreguntas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [todasLasPreguntas[i], todasLasPreguntas[j]] = [todasLasPreguntas[j], todasLasPreguntas[i]];
    }

    console.log('=== CUESTIONARIO COLABORATIVO GENERADO ===');
    console.log(`Total: ${todasLasPreguntas.length} preguntas mezcladas`);
    todasLasPreguntas.forEach((p, i) => {
      console.log(`${i + 1}. [${p.tematica}] ${p.pregunta} (por ${p.aportadoPor})`);
    });

    res.json({
      success: true,
      preguntas: todasLasPreguntas,
      sessionId: `game_${roomCode}_${Date.now()}`,
      message: `Cuestionario colaborativo con ${tematicasArray.length} temáticas`,
      estadisticas: {
        totalTematicas: tematicasArray.length,
        preguntasPorTematica: preguntasPorTematica,
        tematicas: tematicasArray
      }
    });
  } catch (error) {
    console.error('Error generando cuestionario colaborativo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Servicio de IA no disponible. Intenta más tarde.'
    });
  }
});

// POST /api/games/start - Iniciar juego
router.post('/start', (req, res) => {
  const { roomCode, tematicas } = req.body;

  res.json({
    success: true,
    sessionId: 'game_' + Date.now(),
    message: 'Juego iniciado',
  });
});

// POST /api/games/save-result - Guardar resultado
router.post('/save-result', async (req, res) => {
  const { userId, sessionId, score, answers } = req.body;

  const gameResult = {
    partidaId: sessionId, // Usamos sessionId como clave de partición
    userId, // Podría ser un índice secundario para buscar por usuario
    score,
    answers,
    fecha: new Date().toISOString(),
  };

  try {
    await dynamoService.crear('mvpp-estadisticas', gameResult);
    res.status(201).json({ success: true, message: 'Resultado guardado con éxito' });
  } catch (error) {
    console.error('Error al guardar el resultado del juego:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/games/submit-result - Enviar resultado y esperar a todos los jugadores
router.post('/submit-result', async (req, res) => {
  const { roomCode, userId, username, puntaje, tiempoTotal, tematica, dificultad } = req.body;

  console.log('=== RECIBIENDO RESULTADO DE JUGADOR ===');
  console.log('Room:', roomCode, 'Usuario:', username, 'Puntaje:', puntaje, 'Tiempo:', tiempoTotal);

  try {
    // Guardar resultado individual
    const resultado = {
      roomCode,
      userId,
      username,
      puntaje,
      tiempoTotal,
      porcentaje: Math.round((puntaje / 5) * 100),
      fecha: new Date().toISOString()
    };

    await dynamoService.crear('mvpp-resultados-partida', resultado);

    // Obtener información de la sala para saber cuántos jugadores hay
    const sala = await dynamoService.obtenerPorId('mvpp-salas', { id: roomCode });
    const jugadoresEnSala = sala?.jugadores?.length || 2;

    // Obtener todos los resultados de esta sala
    const todosResultados = await dynamoService.consultar({
      TableName: 'mvpp-resultados-partida',
      KeyConditionExpression: 'roomCode = :roomCode',
      ExpressionAttributeValues: {
        ':roomCode': roomCode
      }
    });
    
    console.log(`📊 Resultados en sala ${roomCode}: ${todosResultados.length}/${jugadoresEnSala} jugadores`);
    
    // Solo calcular ranking final cuando todos hayan terminado
    if (todosResultados.length >= jugadoresEnSala) {
      console.log('✅ Todos los jugadores han terminado, calculando ranking final');
      
      // Evaluar y ordenar resultados
      const ranking = todosResultados
        .map(r => ({
          userId: r.userId,
          username: r.username,
          puntaje: r.puntaje,
          tiempoTotal: r.tiempoTotal,
          porcentaje: r.porcentaje
        }))
        .sort((a, b) => {
          // Criterio 1: Más respuestas correctas
          if (b.puntaje !== a.puntaje) {
            return b.puntaje - a.puntaje;
          }
          // Criterio 2: Menor tiempo (desempate)
          return a.tiempoTotal - b.tiempoTotal;
        })
        .map((jugador, index) => ({
          ...jugador,
          posicion: index + 1
        }));

      const ganador = ranking[0];
      console.log('🏆 Ganador determinado:', ganador.username, 'con', ganador.puntaje, 'correctas en', ganador.tiempoTotal, 's');

      const resultadoFinal = {
        success: true,
        allPlayersFinished: true,
        ranking,
        ganador,
        totalJugadores: ranking.length,
        roomCode,
        tematica,
        dificultad
      };

      // Enviar resultados finales a todos los jugadores
      if (req.io) {
        req.io.to(roomCode).emit('game-results', resultadoFinal);
        console.log(`📡 Resultados finales enviados via WebSocket a sala ${roomCode}`);
      }

      res.json(resultadoFinal);
    } else {
      console.log(`⏳ Esperando más jugadores: ${todosResultados.length}/${jugadoresEnSala}`);
      
      // Responder que el resultado fue guardado pero aún no hay ranking final
      res.json({
        success: true,
        allPlayersFinished: false,
        playersFinished: todosResultados.length,
        totalPlayers: jugadoresEnSala,
        message: `Esperando a ${jugadoresEnSala - todosResultados.length} jugador(es) más`
      });
    }

  } catch (error) {
    console.error('Error procesando resultado:', error);
    res.status(500).json({ success: false, message: 'Error procesando resultado' });
  }
});

// GET /api/games/session/:sessionId - Obtener sesión de juego
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // La clave de la tabla 'mvpp-estadisticas' es 'partidaId'
    const gameSession = await dynamoService.obtenerPorId('mvpp-estadisticas', { partidaId: sessionId });

    if (gameSession) {
      // Si se encuentra la sesión, se devuelve
      res.json({ success: true, data: gameSession });
    } else {
      // Si no se encuentra, devolvemos un error 404
      res.status(404).json({ success: false, message: 'No se encontró una sesión de juego con ese ID.' });
    }

  } catch (error) {
    console.error(`Error al obtener la sesión ${sessionId}:`, error);
    res.status(500).json({ success: false, message: 'Error interno del servidor al buscar la sesión.' });
  }
});

module.exports = router;