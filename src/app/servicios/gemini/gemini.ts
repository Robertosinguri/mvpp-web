import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

export interface Pregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  tematica: string;
  dificultad: string;
}

export interface ConfiguracionJuego {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer';
  cantidadPreguntas: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey = 'AIzaSyCQ0u-ZbHVG4XX97zy81ucbW_6lWt6_91s';
  private endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  generateText(prompt: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };
    
    return this.http.post(this.endpoint, body, { headers }).pipe(
      catchError(error => {
        console.error('Error generando preguntas:', error.message || error);
        throw error;
      })
    );
  }

  generarPreguntas(config: ConfiguracionJuego): Observable<Pregunta[]> {
    const prompt = this.construirPrompt(config);
    return this.generateText(prompt).pipe(
      timeout(15000), // 15 segundos timeout
      map(response => this.procesarRespuestaIA(response, config)),
      catchError(error => {
        console.error('Error con Gemini AI:', error);
        console.log('Usando preguntas de fallback debido a:', error.message || 'Error desconocido');
        return of(this.generarPreguntasFallback(config));
      })
    );
  }


  private construirPrompt(config: ConfiguracionJuego): string {
    const nivelDescripcion = {
      'baby': 'muy fáciles, nivel principiante',
      'conocedor': 'de dificultad intermedia',
      'killer': 'muy difíciles, nivel experto'
    };

    return `Genera ${config.cantidadPreguntas} preguntas de trivia sobre "${config.tematica}" que sean ${nivelDescripcion[config.dificultad]}.

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
  }

  private generarPreguntasFallback(config: ConfiguracionJuego): Pregunta[] {
    const preguntas = [
      {
        pregunta: `¿Qué sabes sobre ${config.tematica}?`,
        opciones: ['Mucho', 'Algo', 'Poco', 'Nada'],
        respuestaCorrecta: 1
      },
      {
        pregunta: `¿${config.tematica} es interesante?`,
        opciones: ['Muy interesante', 'Algo interesante', 'Poco interesante', 'Nada interesante'],
        respuestaCorrecta: 0
      },
      {
        pregunta: `¿Dónde aprenderías sobre ${config.tematica}?`,
        opciones: ['Internet', 'Libros', 'Cursos', 'Todas las anteriores'],
        respuestaCorrecta: 3
      },
      {
        pregunta: `¿${config.tematica} requiere práctica?`,
        opciones: ['Sí, mucha', 'Algo de práctica', 'Poca práctica', 'Ninguna'],
        respuestaCorrecta: 0
      },
      {
        pregunta: `¿Recomendarías ${config.tematica}?`,
        opciones: ['Definitivamente', 'Probablemente', 'Tal vez', 'No'],
        respuestaCorrecta: 0
      }
    ];
    
    return preguntas.slice(0, config.cantidadPreguntas).map(p => ({
      ...p,
      tematica: config.tematica,
      dificultad: config.dificultad
    }));
  }

  private procesarRespuestaIA(response: any, config: ConfiguracionJuego): Pregunta[] {
    try {
      const texto = response.candidates[0].content.parts[0].text;
      
      // Limpiar el texto para extraer solo el JSON
      let jsonText = texto.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const preguntasIA = JSON.parse(jsonText);
      
      return preguntasIA.map((p: any) => ({
        pregunta: p.pregunta,
        opciones: p.opciones,
        respuestaCorrecta: Number(p.respuestaCorrecta),
        tematica: config.tematica,
        dificultad: config.dificultad
      }));
    } catch (error) {
      console.error('❌ Error procesando respuesta de IA:', error);
      console.log('🔄 Usando preguntas de fallback');
      return this.generarPreguntasFallback(config);
    }
  }
}