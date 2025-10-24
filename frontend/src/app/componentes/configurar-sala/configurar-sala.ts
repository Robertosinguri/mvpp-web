import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background'; // La ruta ya era correcta, solo se asegura que el componente exista
import { RoomsService } from '../../servicios/salas/rooms.service';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';

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
export class ConfigurarSalaComponent implements OnInit {
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private authService: CognitoAuthService
  ) {}

  ngOnInit() {
    // Determinar si es host o invitado basado en la ruta
    this.esHost = this.router.url.includes('crear');
    
    // Si es invitado, obtener código de sala de los parámetros
    if (!this.esHost) {
      this.codigoSala = this.route.snapshot.queryParams['codigo'] || '';
      this.cargarInfoSala();
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
    if (!this.esConfiguracionValida() || this.isLoading) return;

    this.isLoading = true;

    try {
      // 1. Obtener el usuario actual para saber quién es el host
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      if (!user || !attributes['sub']) {
        throw new Error('Usuario no autenticado. No se puede crear la sala.');
      }

      // 2. Preparar los datos para enviar al backend
      const roomData = {
        nombre: `${user.username}'s Game`, // O un nombre que el usuario pueda introducir
        maxJugadores: this.configuracion.jugadores!,
        host: {
          id: attributes['sub'],
          nombre: user.username
        }
      };

      // 3. Llamar al servicio para crear la sala
      this.roomsService.createRoom(roomData).subscribe(response => {
        if (response.success) {
          // 4. Navegar al lobby con el código REAL devuelto por el backend
          this.router.navigate(['/lobby'], { 
            queryParams: { codigo: response.roomCode, host: true } 
          });
        }
      });
    } catch (error) {
      console.error('Error al crear la sala:', error);
      this.isLoading = false;
    }
  }

  confirmarConfiguracion() {
    if (!this.esConfiguracionValida()) return;

    // TODO: Enviar configuración al backend
    console.log('Configuración del invitado:', this.configuracion);
    
    // Navegar al lobby como invitado
    this.router.navigate(['/lobby'], { 
      queryParams: { 
        codigo: this.codigoSala, 
        host: false 
      } 
    });
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
}