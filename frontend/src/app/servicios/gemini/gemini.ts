import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout, retry, delay } from 'rxjs/operators';

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

  constructor(private http: HttpClient) { }

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

    return this.http.post(this.endpoint, body, { headers });
  }

  generarPreguntas(config: ConfiguracionJuego): Observable<Pregunta[]> {
    const prompt = this.construirPrompt(config);
    return this.generateText(prompt).pipe(
      timeout(20000),
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`🔄 Reintento ${retryCount}/2 - Generando preguntas con IA...`);
          return of(error).pipe(delay(2000));
        }
      }),
      map(response => this.procesarRespuestaIA(response, config)),
      catchError(error => {
        console.error('❌ Error crítico: No se pueden generar preguntas con IA después de 3 intentos');
        return throwError(() => new Error('Servicio de IA no disponible. Verifica tu conexión a internet.'));
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

  private procesarRespuestaIA(response: any, config: ConfiguracionJuego): Pregunta[] {
    try {
      const texto = response.candidates[0].content.parts[0].text;

      let jsonText = texto.trim();
      
      // Remover bloques de markdown (bien o mal cerrados)
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/^```\s*/, '');
      jsonText = jsonText.replace(/```\s*$/, '').replace(/\s*```.*$/, '');
      jsonText = jsonText.trim();

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
      throw new Error('Respuesta de IA inválida');
    }
  }
}