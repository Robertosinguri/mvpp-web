import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { RoomsService } from '../../servicios/salas/rooms.service';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { WebSocketService } from '../../servicios/websocket/websocket.service';

interface ConfiguracionJugador {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer' | '';
  jugadores?: number;
}

interface InfoSalaExistente {
  codigo: string;
  host: string;
  jugadoresActuales: number;
  maxJugadores: number;
  jugadores: Array<{
    nombre: string;
    tematica: string;
    dificultad: string;
    esHost: boolean;
  }>;
}

@Component({
  selector: 'app-configurar-sala',
  standalone: true,
  imports: [FormsModule, CommonModule, bkgComponent], // Ahora BackgroundComponent será reconocido
  templateUrl: './configurar-sala.html',
  styleUrls: ['./configurar-sala.scss']
})
export class ConfigurarSalaComponent implements OnInit, OnDestroy {
  isLoading = false;
  configuracion: ConfiguracionJugador = {
    tematica: '',
    dificultad: '',
    jugadores: 2
  };

  esHost: boolean = true;
  codigoSala: string = '';
  
  sugerenciasTematicas: string[] = [
    'deportes', 'historia', 'ciencia', 'música', 
    'cine', 'tecnología', 'cocina', 'arte'
  ];
  
  infoSalaExistente?: InfoSalaExistente;
  jugadoresEnTiempoReal: Array<{
    nombre: string;
    tematica: string;
    dificultad: string;
    esHost: boolean;
    configurado: boolean;
  }> = [];
  currentUserId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private authService: CognitoAuthService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Obtener usuario actual
    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      this.currentUserId = attributes['sub'] || '';
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      this.router.navigate(['/login']);
      return;
    }

    // Determinar si es host o invitado basado en la ruta
    this.esHost = this.router.url.includes('crear');
    
    if (this.esHost) {
      // Generar código de vista previa para mostrar en la UI
      this.codigoSala = this.generatePreviewCode();
    } else {
      // Si es invitado, obtener código de sala de los parámetros
      this.codigoSala = this.route.snapshot.queryParams['codigo'] || '';
      this.cargarInfoSala();
      this.conectarWebSocket();
    }
  }

  ngOnDestroy() {
    if (this.codigoSala && this.currentUserId) {
      this.webSocketService.leaveRoom(this.codigoSala, this.currentUserId);
    }
  }

  tematicaInvalida: boolean = false;

  validarTematica(event: any) {
    const valor = event.target.value;
    const palabras = this.contarPalabras(valor);
    this.tematicaInvalida = palabras > 3;
    
    if (this.tematicaInvalida) {
      // Truncar a las primeras 3 palabras
      const palabrasArray = valor.trim().split(/\s+/);
      if (palabrasArray.length > 3) {
        this.configuracion.tematica = palabrasArray.slice(0, 3).join(' ');
        this.tematicaInvalida = false;
      }
    }
  }

  contarPalabras(texto: string): number {
    if (!texto || texto.trim() === '') return 0;
    return texto.trim().split(/\s+/).length;
  }

  esConfiguracionValida(): boolean {
    return this.configuracion.tematica.trim() !== '' && 
           this.configuracion.dificultad !== '' &&
           !this.tematicaInvalida &&
           this.contarPalabras(this.configuracion.tematica) <= 3 &&
           (!this.esHost || (this.configuracion.jugadores !== undefined && this.configuracion.jugadores >= 2));
  }

  getDistribucionPreguntas(): string {
    if (!this.configuracion.jugadores) return '';
    
    const preguntasPorJugador = Math.floor(5 / this.configuracion.jugadores);
    const preguntasExtra = 5 % this.configuracion.jugadores;
    
    if (preguntasExtra === 0) {
      return `${preguntasPorJugador} preguntas por jugador`;
    } else {
      return `${preguntasPorJugador}-${preguntasPorJugador + 1} preguntas por jugador`;
    }
  }

  async crearSala() {
    console.log('=== CREAR SALA INICIADO ===');
    console.log('Configuración válida:', this.esConfiguracionValida());
    console.log('isLoading:', this.isLoading);
    
    if (!this.esConfiguracionValida() || this.isLoading) return;

    this.isLoading = true;
    console.log('Obteniendo usuario...');

    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      if (!user || !attributes['sub']) {
        throw new Error('Usuario no autenticado');
      }

      const roomData = {
        nombre: `${user.username}'s Game`,
        maxJugadores: this.configuracion.jugadores!,
        host: {
          id: attributes['sub'],
          nombre: user.username,
          tematica: this.configuracion.tematica.trim(),
          dificultad: this.configuracion.dificultad
        }
      };

      this.roomsService.createRoom(roomData).subscribe({
        next: (response) => {
          console.log('Respuesta crear sala:', response);
          if (response.success) {
            console.log('Navegando al lobby con código:', response.roomCode);
            this.router.navigate(['/lobby'], {
              queryParams: {
                codigo: response.roomCode,
                host: 'true'
              }
            }).then(success => {
              console.log('Navegación exitosa:', success);
            }).catch(error => {
              console.error('Error en navegación:', error);
            });
          } else {
            console.error('Error en respuesta:', response);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error HTTP crear sala:', err);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
    }
  }

  async confirmarConfiguracion() {
    if (!this.esConfiguracionValida() || this.isLoading) return;

    this.isLoading = true;

    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      if (!user || !attributes['sub']) {
        throw new Error('Usuario no autenticado');
      }

      const jugadorData = {
        id: attributes['sub'],
        nombre: user.username,
        tematica: this.configuracion.tematica.trim(),
        dificultad: this.configuracion.dificultad
      };

      this.roomsService.joinRoom(this.codigoSala, jugadorData).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/lobby'], {
              queryParams: {
                codigo: this.codigoSala,
                host: 'false'
              }
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error:', err);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
    }
  }

  seleccionarSugerencia(sugerencia: string) {
    this.configuracion.tematica = sugerencia;
  }

  cargarInfoSala() {
    if (!this.codigoSala) return;

    this.roomsService.getRoom(this.codigoSala).subscribe({
      next: (sala) => {
        const host = sala.jugadores.find(j => j.esHost);
        this.infoSalaExistente = {
          codigo: sala.id,
          host: host ? host.nombre : 'Desconocido',
          jugadoresActuales: sala.jugadores.length,
          maxJugadores: sala.maxJugadores,
          jugadores: sala.jugadores.map(j => ({ 
            ...j, 
            tematica: j.tematica || '', // Aseguramos que tematica sea siempre un string
            dificultad: j.dificultad || '' // Aseguramos que dificultad sea siempre un string
          }))
        };
      },
      error: (err) => console.error('Error al cargar la información de la sala:', err)
    });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  private generatePreviewCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private conectarWebSocket(): void {
    if (this.codigoSala && this.currentUserId) {
      this.webSocketService.joinRoom(this.codigoSala, this.currentUserId);
      
      this.webSocketService.onUserJoined().subscribe(() => {
        this.cargarInfoSala();
      });
      
      this.webSocketService.onUserLeft().subscribe(() => {
        this.cargarInfoSala();
      });
      
      this.webSocketService.onUserConfigured().subscribe(() => {
        this.cargarInfoSala();
      });
    }
  }

  copiado = false;

  copiarCodigo() {
    navigator.clipboard.writeText(this.codigoSala).then(() => {
      console.log('Código copiado:', this.codigoSala);
      this.copiado = true;
      this.cdr.detectChanges();
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  // Método eliminado: iniciarJuego() - obsoleto
  // El flujo correcto es: ConfigurarSala → Lobby → Arena
}