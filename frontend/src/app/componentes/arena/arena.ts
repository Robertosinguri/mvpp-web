import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { EstadisticasService, ResultadoJuego } from '../../servicios/estadisticas/estadisticas.service';
import { WebSocketService } from '../../servicios/websocket/websocket.service';
import { bkgComponent } from '../background/background';

interface PreguntaArena {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  tematica: string;
  dificultad: string;
  aportadoPor?: string;
}

@Component({
  selector: 'app-arena',
  standalone: true,
  imports: [CommonModule, bkgComponent],
  templateUrl: './arena.html',
  styleUrls: ['./arena.scss']
})
export class ArenaComponent implements OnInit, OnDestroy {
  // Configuración de la arena
  roomCode: string = '';
  tematicas: string[] = [];
  dificultad: string = 'baby';
  
  // Estado del juego
  estadoJuego: 'cargando' | 'jugando' | 'finalizado' = 'cargando';
  preguntas: PreguntaArena[] = [];
  preguntaActual: number = 0;
  totalPreguntas: number = 5;
  
  // Estado de la pregunta actual
  preguntaActualObj: PreguntaArena | null = null;
  respuestaSeleccionada: number | null = null;
  mostrarRespuesta: boolean = false;
  respuestaCorrecta: boolean = false;
  
  // Puntaje y tiempo
  puntaje: number = 0;
  tiempoRestante: number = 30;
  tiempoInicio: number = 0;
  timerInterval: any;
  
  // Usuario actual
  nombreJugador: string = '';
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: CognitoAuthService,
    private estadisticasService: EstadisticasService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🏟️ ARENA COMPONENT INICIADO');
    console.log('URL actual:', this.router.url);
    console.log('Parámetros recibidos:', this.route.snapshot.queryParams);
    await this.cargarUsuario();
    this.cargarConfiguracion();
    this.configurarWebSocket();
    this.iniciarArena();
  }

  ngOnDestroy() {
    this.limpiarTimer();
    this.webSocketService.disconnect();
  }

  private async cargarUsuario() {
    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      this.nombreJugador = attributes['name'] || user?.username || 'Jugador';
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      this.nombreJugador = 'Jugador';
    }
  }

  private cargarConfiguracion() {
    const params = this.route.snapshot.queryParams;
    this.roomCode = params['roomCode'] || '';
    this.dificultad = params['dificultad'] || 'baby';
    
    if (params['tematicas']) {
      this.tematicas = params['tematicas'].split(',').filter((t: string) => t.trim());
    }
    
    console.log('=== CONFIGURACIÓN ARENA ===');
    console.log('Room Code:', this.roomCode);
    console.log('Temáticas:', this.tematicas);
    console.log('Dificultad:', this.dificultad);
  }

  private configurarWebSocket() {
    // Unirse a la sala
    this.webSocketService.joinRoom(this.roomCode, this.nombreJugador);
    
    // Escuchar resultados sincronizados
    const gameResultsObservable = new Observable(observer => {
      this.webSocketService.socket.on('game-results', (data) => observer.next(data));
    });
    
    gameResultsObservable.subscribe((data: any) => {
      console.log('📡 Resultados recibidos via WebSocket:', data);
      
      // Guardar resultados sincronizados
      localStorage.setItem('ranking-partida', JSON.stringify(data.ranking));
      localStorage.setItem('ganador-partida', JSON.stringify(data.ganador));
      
      // Navegar a resultados
      this.router.navigate(['/resultados'], {
        queryParams: {
          roomCode: data.roomCode,
          tema: data.tematica,
          dificultad: data.dificultad
        }
      });
    });
  }

  private async iniciarArena() {
    this.estadoJuego = 'cargando';
    this.tiempoInicio = Date.now();
    
    console.log('=== INICIANDO ARENA MULTIJUGADOR ===');
    
    try {
      const response = await fetch('http://localhost:3000/api/games/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomCode: this.roomCode,
          tematicas: this.tematicas.join(','),
          dificultad: this.dificultad
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.preguntas = data.preguntas;
        console.log(`✓ Arena cargada: ${this.preguntas.length} preguntas`);
        this.preguntas.forEach((p, i) => {
          console.log(`${i + 1}. [${p.tematica}] ${p.pregunta}`);
        });
        
        this.cargarPreguntaActual();
        this.estadoJuego = 'jugando';
        this.cdr.detectChanges();
        this.iniciarTimer();
      } else {
        this.mostrarErrorIA(data.message || 'Error del servidor generando preguntas');
        return;
      }
    } catch (error) {
      console.error('Error cargando arena:', error);
      this.mostrarErrorIA('Error conectando con el servidor de preguntas');
    }
  }

  private cargarPreguntaActual() {
    if (this.preguntaActual < this.preguntas.length) {
      this.preguntaActualObj = this.preguntas[this.preguntaActual];
      this.respuestaSeleccionada = null;
      this.mostrarRespuesta = false;
      this.respuestaCorrecta = false;
      this.tiempoRestante = 30;
    }
  }

  private iniciarTimer() {
    this.limpiarTimer();
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      this.cdr.detectChanges();
      
      if (this.tiempoRestante <= 0) {
        this.tiempoAgotado();
      }
    }, 1000);
  }

  private limpiarTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private tiempoAgotado() {
    this.limpiarTimer();
    if (!this.mostrarRespuesta) {
      this.confirmarRespuesta();
    }
  }

  seleccionarRespuesta(indice: number) {
    if (!this.mostrarRespuesta) {
      this.respuestaSeleccionada = indice;
    }
  }

  confirmarRespuesta() {
    if (this.preguntaActualObj) {
      this.limpiarTimer();
      this.mostrarRespuesta = true;
      
      if (this.respuestaSeleccionada === this.preguntaActualObj.respuestaCorrecta) {
        this.respuestaCorrecta = true;
        this.puntaje++;
      } else {
        this.respuestaCorrecta = false;
      }
      
      this.cdr.detectChanges();
    }
  }

  siguientePregunta() {
    if (this.esUltimaPregunta()) {
      this.finalizarArena();
    } else {
      this.preguntaActual++;
      this.cargarPreguntaActual();
      this.iniciarTimer();
    }
  }

  private async finalizarArena() {
    this.limpiarTimer();
    this.estadoJuego = 'finalizado';
    
    console.log('🏁 FINALIZANDO ARENA - Enviando resultado al backend');
    
    try {
      const usuario = this.authService.usuarioActual();
      if (!usuario?.email) {
        console.log('No hay usuario autenticado');
        return;
      }

      const tiempoTotal = Math.floor((Date.now() - this.tiempoInicio) / 1000);
      
      // Obtener userId correcto
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser?.username || usuario.email || 'user1';
      
      // Enviar resultado al backend y obtener ranking completo
      const response = await fetch('http://localhost:3000/api/games/submit-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomCode: this.roomCode,
          userId: userId,
          username: this.nombreJugador,
          puntaje: this.puntaje,
          tiempoTotal: tiempoTotal,
          tematica: this.tematicas.join(','),
          dificultad: this.dificultad
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.allPlayersFinished) {
          console.log('✅ Todos terminaron. Ranking recibido:', data.ranking.length, 'jugadores');
          console.log('🏆 Ganador:', data.ganador.username);
          
          // Guardar ranking en localStorage para resultados
          localStorage.setItem('ranking-partida', JSON.stringify(data.ranking));
          localStorage.setItem('ganador-partida', JSON.stringify(data.ganador));
          
          // Navegar a resultados con datos reales
          this.router.navigate(['/resultados'], {
            queryParams: {
              roomCode: this.roomCode,
              tema: this.tematicas.join(','),
              dificultad: this.dificultad
            }
          });
        } else {
          console.log(`⏳ Esperando otros jugadores: ${data.playersFinished}/${data.totalPlayers}`);
          this.mostrarPantallaEspera(data.playersFinished, data.totalPlayers);
        }
      } else {
        console.error('Error del servidor:', data.message);
        alert('Error procesando resultados. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('❌ Error enviando resultado:', error);
      alert('Error de conexión. Verifica tu internet.');
    }
  }

  esUltimaPregunta(): boolean {
    return this.preguntaActual >= this.totalPreguntas - 1;
  }

  get progreso(): number {
    return ((this.preguntaActual + 1) / this.totalPreguntas) * 100;
  }

  getLetraOpcion(indice: number): string {
    return String.fromCharCode(65 + indice);
  }

  getTematicasTexto(): string {
    return this.tematicas.join(' vs ');
  }

  private mostrarErrorIA(mensaje: string) {
    this.limpiarTimer();
    this.estadoJuego = 'finalizado';
    alert(`❌ Error: ${mensaje}\n\nNo se pueden generar preguntas en este momento. Por favor, intenta más tarde.`);
    this.salirArena();
  }

  salirArena() {
    this.router.navigate(['/dashboard']);
  }

  private mostrarPantallaEspera(jugadoresTerminados: number, totalJugadores: number) {
    this.estadoJuego = 'finalizado';
    
    // Mostrar mensaje de espera
    const mensaje = `Has terminado tu partida.\n\nEsperando a ${totalJugadores - jugadoresTerminados} jugador(es) más...\n\nJugadores terminados: ${jugadoresTerminados}/${totalJugadores}`;
    
    // Cambiar el HTML para mostrar estado de espera
    const arenaContainer = document.querySelector('.arena-container');
    if (arenaContainer) {
      arenaContainer.innerHTML = `
        <div class="waiting-screen">
          <h2>🏁 ¡Partida Terminada!</h2>
          <div class="waiting-message">
            <p>Has completado tu cuestionario.</p>
            <p>Esperando a que terminen los demás jugadores...</p>
            <div class="progress-info">
              <span class="progress-text">Jugadores terminados: ${jugadoresTerminados}/${totalJugadores}</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${(jugadoresTerminados/totalJugadores)*100}%"></div>
              </div>
            </div>
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }
    
    console.log('⏳ Mostrando pantalla de espera');
  }
}