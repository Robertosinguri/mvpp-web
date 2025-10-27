import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, timeout, retry, delay, switchMap } from 'rxjs/operators';

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
    
    // Agregar delay inicial para evitar rate limiting
    return of(null).pipe(
      delay(Math.random() * 1000), // Delay aleatorio de 0-1 segundo
      switchMap(() => this.generateText(prompt)),
      timeout(20000),
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`🔄 Reintento ${retryCount}/2 - Generando preguntas con IA...`);
          return of(error).pipe(delay(3000)); // Delay más largo entre reintentos
        }
      }),
      map(response => this.procesarRespuestaIA(response, config)),
      catchError(error => {
        console.error('❌ Error crítico: No se pueden generar preguntas con IA después de 3 intentos');
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        
        let errorMessage = 'Servicio de IA no disponible.';
        
        if (error.status === 503) {
          errorMessage = 'Servicio de IA temporalmente sobrecargado. Intenta en unos minutos.';
        } else if (error.status === 429) {
          errorMessage = 'Límite de requests excedido. Espera un momento antes de intentar nuevamente.';
        } else if (error.status === 403) {
          errorMessage = 'API Key inválida o sin permisos.';
        } else if (error.status === 400) {
          errorMessage = 'Request inválido. Verifica la configuración.';
        }
        
        return throwError(() => new Error(errorMessage));
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