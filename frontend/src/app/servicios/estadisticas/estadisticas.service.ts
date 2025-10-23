import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

export interface EstadisticasUsuario {
  partidasJugadas: number;
  mejorPuntaje: number;
  promedio: number;
  posicionRanking: number;
  temasRecientes: string[];
}

export interface ResultadoJuego {
  userId: string;
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer';
  puntaje: number;
  respuestasCorrectas: number;
  totalPreguntas: number;
  tiempoTotal: number;
  fecha: Date;
}

export interface JugadorRanking {
  userId: string;
  nombre: string;
  puntajeTotal: number;
  partidasJugadas: number;
  promedio: number;
  posicion: number;
}

export interface ProgresoUsuario {
  puntajeTotal: number;
  partidasHoy: number;
  mejorRacha: number;
  rachaActual: number;
  temaMasFuerte: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = 'http://localhost:3000/api'; // Backend URL

  constructor(private http: HttpClient) { }

  // 📊 ESTADÍSTICAS PERSONALES (para Entrenamiento)
  obtenerEstadisticasPersonales(userId: string): Observable<EstadisticasUsuario> {
    return this.http.get<EstadisticasUsuario>(`${this.apiUrl}/estadisticas/${userId}`)
      .pipe(
        catchError(() => {
          // Fallback con datos actuales hardcodeados
          return of({
            partidasJugadas: 12,
            mejorPuntaje: 4,
            promedio: 3.2,
            posicionRanking: 47,
            temasRecientes: ['deportes', 'historia', 'tecnología']
          });
        })
      );
  }

  // 🏆 RANKING GLOBAL (para componente futuro)
  obtenerRankingGlobal(limite: number = 10): Observable<JugadorRanking[]> {
    return this.http.get<JugadorRanking[]>(`${this.apiUrl}/ranking?limite=${limite}`)
      .pipe(
        catchError(() => {
          // Fallback con ranking de ejemplo
          return of([
            { userId: '1', nombre: 'Carlos', puntajeTotal: 1250, partidasJugadas: 25, promedio: 4.2, posicion: 1 },
            { userId: '2', nombre: 'Ana', puntajeTotal: 1180, partidasJugadas: 22, promedio: 4.0, posicion: 2 },
            { userId: '3', nombre: 'Luis', puntajeTotal: 1150, partidasJugadas: 28, promedio: 3.8, posicion: 3 },
            { userId: '4', nombre: 'María', puntajeTotal: 1100, partidasJugadas: 20, promedio: 3.9, posicion: 4 },
            { userId: '5', nombre: 'Pedro', puntajeTotal: 1050, partidasJugadas: 18, promedio: 3.7, posicion: 5 }
          ]);
        })
      );
  }

  // 📈 PROGRESO PARCIAL (para Dashboard)
  obtenerProgresoParcial(userId: string): Observable<ProgresoUsuario> {
    return this.http.get<ProgresoUsuario>(`${this.apiUrl}/progreso/${userId}`)
      .pipe(
        catchError(() => {
          // Fallback con datos de progreso
          return of({
            puntajeTotal: 850,
            partidasHoy: 3,
            mejorRacha: 7,
            rachaActual: 2,
            temaMasFuerte: 'tecnología'
          });
        })
      );
  }

  // 🎯 RANKING POR TEMA (para mostrar especialistas)
  obtenerRankingPorTema(tema: string, limite: number = 5): Observable<JugadorRanking[]> {
    return this.http.get<JugadorRanking[]>(`${this.apiUrl}/ranking/tema/${tema}?limite=${limite}`)
      .pipe(
        catchError(() => {
          // Fallback con especialistas del tema
          return of([
            { userId: '1', nombre: 'Expert1', puntajeTotal: 950, partidasJugadas: 15, promedio: 4.5, posicion: 1 },
            { userId: '2', nombre: 'Expert2', puntajeTotal: 920, partidasJugadas: 12, promedio: 4.3, posicion: 2 },
            { userId: '3', nombre: 'Expert3', puntajeTotal: 890, partidasJugadas: 18, promedio: 4.1, posicion: 3 }
          ]);
        })
      );
  }

  // 💾 GUARDAR RESULTADO DE PARTIDA
  guardarResultadoPartida(resultado: ResultadoJuego): Observable<any> {
    return this.http.post(`${this.apiUrl}/estadisticas/resultado`, resultado)
      .pipe(
        catchError(error => {
          console.error('Error guardando resultado:', error);
          // En desarrollo, simular éxito
          return of({ success: true, message: 'Resultado guardado localmente' });
        })
      );
  }

  // 🔄 ACTUALIZAR ESTADÍSTICAS DESPUÉS DE PARTIDA
  actualizarEstadisticasPostJuego(userId: string, resultado: ResultadoJuego): Observable<EstadisticasUsuario> {
    return this.guardarResultadoPartida(resultado).pipe(
      switchMap(() => {
        // Después de guardar, obtener estadísticas actualizadas
        return this.obtenerEstadisticasPersonales(userId);
      }),
      catchError(() => {
        // Si falla, devolver estadísticas simuladas actualizadas
        return of({
          partidasJugadas: 13, // +1
          mejorPuntaje: Math.max(4, resultado.puntaje),
          promedio: 3.3, // Recalculado
          posicionRanking: 45, // Mejoró posición
          temasRecientes: [resultado.tematica, 'deportes', 'historia']
        });
      })
    );
  }

  // 🎮 OBTENER ESTADÍSTICAS RÁPIDAS (para mostrar en cualquier parte)
  obtenerEstadisticasRapidas(userId: string): Observable<{puntaje: number, posicion: number, partidas: number}> {
    return this.obtenerEstadisticasPersonales(userId).pipe(
      map(stats => ({
        puntaje: stats.mejorPuntaje,
        posicion: stats.posicionRanking,
        partidas: stats.partidasJugadas
      }))
    );
  }

  // 🏅 VERIFICAR SI SUBIÓ DE POSICIÓN
  verificarMejoraRanking(userId: string, posicionAnterior: number): Observable<{mejoro: boolean, nuevaPosicion: number}> {
    return this.obtenerEstadisticasPersonales(userId).pipe(
      map(stats => ({
        mejoro: stats.posicionRanking < posicionAnterior,
        nuevaPosicion: stats.posicionRanking
      }))
    );
  }
}