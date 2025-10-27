import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environments';
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
  private apiUrl = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerEstadisticasPersonales(userId: string, username?: string): Observable<EstadisticasUsuario | null> {
    let url = `${this.apiUrl}/${userId}`;
    if (username) {
      url += `?username=${encodeURIComponent(username)}`;
    }
    
    console.log('📊 Obteniendo estadísticas:', { userId, username, url });
    
    return this.http.get<EstadisticasUsuario>(url).pipe(
      catchError(error => {
        console.error('Error al obtener estadísticas personales:', error);
        return of(null);
      })
    );
  }

  obtenerRankingGlobal(limite: number = 10): Observable<JugadorRanking[] | null> {
    const url = `${this.apiUrl}/ranking?limite=${limite}`;
    console.log('🚀 Llamando a:', url);
    return this.http.get<JugadorRanking[]>(url).pipe(
      map(data => {
        console.log('📊 Respuesta del servidor:', data);
        return data;
      }),
      catchError(error => {
        console.error('❌ Error al obtener ranking global:', error);
        return of(null);
      })
    );
  }

  obtenerProgresoParcial(userId: string): Observable<ProgresoUsuario | null> {
    return this.http.get<ProgresoUsuario>(`${this.apiUrl}/progreso/${userId}`).pipe(
      catchError(error => {
        console.error('Error al obtener progreso parcial:', error);
        return of(null);
      })
    );
  }

  obtenerRankingPorTema(tema: string, limite: number = 5): Observable<JugadorRanking[] | null> {
    return this.http.get<JugadorRanking[]>(`${this.apiUrl}/ranking/tema/${tema}?limite=${limite}`).pipe(
      catchError(error => {
        console.error('Error al obtener ranking por tema:', error);
        return of(null);
      })
    );
  }

  guardarResultadoPartida(resultado: ResultadoJuego): Observable<any> {
    return this.http.post(`${this.apiUrl}/resultado`, resultado).pipe(
      catchError(error => {
        console.error('Error guardando resultado de partida:', error);
        return of({ success: false, message: 'Error al guardar resultado' });
      })
    );
  }

  actualizarEstadisticasPostJuego(userId: string, resultado: ResultadoJuego): Observable<EstadisticasUsuario | null> {
    return this.guardarResultadoPartida(resultado).pipe(
      switchMap(res => {
        if (res.success) {
          return this.obtenerEstadisticasPersonales(userId);
        } else {
          return of(null);
        }
      }),
      catchError(error => {
        console.error('Error al actualizar estadísticas post juego:', error);
        return of(null);
      })
    );
  }

  obtenerEstadisticasRapidas(userId: string): Observable<{ puntaje: number; posicion: number; partidas: number } | null> {
    return this.obtenerEstadisticasPersonales(userId).pipe(
      map(stats => stats ? {
        puntaje: stats.mejorPuntaje,
        posicion: stats.posicionRanking,
        partidas: stats.partidasJugadas
      } : null),
      catchError(error => {
        console.error('Error al obtener estadísticas rápidas:', error);
        return of(null);
      })
    );
  }

  verificarMejoraRanking(userId: string, posicionAnterior: number): Observable<{ mejoro: boolean; nuevaPosicion: number } | null> {
    return this.obtenerEstadisticasPersonales(userId).pipe(
      map(stats => stats ? {
        mejoro: stats.posicionRanking < posicionAnterior,
        nuevaPosicion: stats.posicionRanking
      } : null),
      catchError(error => {
        console.error('Error al verificar mejora de ranking:', error);
        return of(null);
      })
    );
  }
}
