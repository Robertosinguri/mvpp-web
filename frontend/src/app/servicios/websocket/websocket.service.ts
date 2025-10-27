import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public socket: Socket;
  private readonly serverUrl = environment.production ? 
    window.location.origin.replace('https://', 'wss://').replace('http://', 'ws://') : 
    'http://localhost:3000';

  constructor() {
    this.socket = io(this.serverUrl);
  }

  // Unirse a una sala
  joinRoom(roomCode: string, userId: string): void {
    this.socket.emit('join-room', { roomCode, userId });
  }

  // Escuchar cuando un usuario se une
  onUserJoined(): Observable<{ userId: string }> {
    return new Observable(observer => {
      this.socket.on('user-joined', (data) => observer.next(data));
    });
  }

  // Escuchar cuando un usuario sale
  onUserLeft(): Observable<{ userId: string }> {
    return new Observable(observer => {
      this.socket.on('user-left', (data) => observer.next(data));
    });
  }

  // Escuchar cuando un usuario se configura
  onUserConfigured(): Observable<{ userId: string }> {
    return new Observable(observer => {
      this.socket.on('user-configured', (data) => observer.next(data));
    });
  }

  // Escuchar cuando el juego inicia
  onGameStarted(): Observable<{ gameData: any }> {
    return new Observable(observer => {
      this.socket.on('game-started', (data) => observer.next(data));
    });
  }

  // Salir de sala
  leaveRoom(roomCode: string, userId: string): void {
    this.socket.emit('leave-room', { roomCode, userId });
  }

  // Desconectar
  disconnect(): void {
    this.socket.disconnect();
  }
}