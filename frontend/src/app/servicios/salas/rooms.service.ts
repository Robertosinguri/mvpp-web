import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

// Define interfaces que coincidan con la estructura de datos de tu backend
export interface Jugador {
  id: string;
  nombre: string;
  esHost: boolean;
  configurado: boolean;
  tematica?: string;
  dificultad?: 'baby' | 'conocedor' | 'killer';
}

export interface Sala {
  id: string;
  nombre: string;
  estado: 'esperando' | 'en-juego' | 'finalizada';
  maxJugadores: number;
  fechaCreacion: string;
  jugadores: Jugador[];
  // Añade cualquier otra propiedad que tu objeto Sala pueda tener del backend
}

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private apiUrl = `${environment.apiUrl}/rooms`; // URL base de las rutas de salas de tu backend

  constructor(private http: HttpClient) { }

  // Obtener detalles de una sala por su código
  getRoom(roomCode: string): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/${roomCode}`);
  }

  // Crear una nueva sala (normalmente llamado desde el componente configurar-sala)
  createRoom(roomData: { nombre: string; maxJugadores: number; host: { id: string; nombre: string } }): Observable<{ success: boolean; roomCode: string; sala: Sala }> {
    return this.http.post<{ success: boolean; roomCode: string; sala: Sala }>(`${this.apiUrl}/`, roomData);
  }

  // Unirse a una sala existente
  joinRoom(roomCode: string, jugador: { id: string; nombre: string }): Observable<{ success: boolean; sala: Sala; message?: string }> {
    return this.http.post<{ success: boolean; sala: Sala; message?: string }>(`${this.apiUrl}/${roomCode}/join`, jugador);
  }

  // Salir de una sala
  leaveRoom(roomCode: string, userId: string): Observable<{ success: boolean; sala: Sala | null }> {
    return this.http.delete<{ success: boolean; sala: Sala | null }>(`${this.apiUrl}/${roomCode}/leave`, {
      body: { userId }
    });
  }

  // Configurar jugador (temática y dificultad)
  configurePlayer(roomCode: string, userId: string, tematica: string, dificultad: 'baby' | 'conocedor' | 'killer'): Observable<{ success: boolean; sala: Sala }> {
    return this.http.put<{ success: boolean; sala: Sala }>(`${this.apiUrl}/${roomCode}/configure`, {
      userId,
      tematica,
      dificultad
    });
  }
}