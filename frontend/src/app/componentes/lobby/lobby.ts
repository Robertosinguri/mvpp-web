import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { RoomsService, Jugador, Sala } from '../../servicios/salas/rooms.service'; // Ruta actualizada a la nueva ubicación
import { HttpClientModule } from '@angular/common/http'; // Necesario para HttpClient en componentes standalone
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service'; // Importamos el servicio de autenticación

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule, bkgComponent, HttpClientModule], // Añade HttpClientModule
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.scss']
})
export class LobbyComponent implements OnInit {
  private readonly TOTAL_PREGUNTAS_PARTIDA = 5;
  private readonly MIN_JUGADORES_PARA_INICIAR = 2;

  codigoSala: string = '';
  esHost: boolean = false;
  maxJugadores: number = 4; // Valor por defecto, se actualizará con los datos de la sala
  emailInvitacion: string = '';
  
  jugadores: Jugador[] = [];
  sala: Sala | null = null; // Para almacenar el objeto completo de la sala
  currentUser: Jugador | null = null; // Ahora puede ser nulo hasta que se cargue

  constructor(
    private router: Router,
    private route: ActivatedRoute, // COMA FALTANTE CORREGIDA
    private roomsService: RoomsService, // Inyecta el nuevo servicio
    private authService: CognitoAuthService // Inyectamos el servicio de autenticación
  ) {}

  ngOnInit() {
    // Primero, obtenemos el usuario actual. El resto de la lógica depende de esto.
    this.initializeUserAndLobby();
  }

  private async initializeUserAndLobby(): Promise<void> {
    try {
      // 1. Obtener el objeto de usuario de Cognito
      const cognitoUser = await this.authService.getCurrentUser();
      if (!cognitoUser) {
        throw new Error('No hay usuario autenticado.');
      }

      // 2. Obtener los atributos de ese usuario
      const attributes = await this.authService.getUserAttributes();

      const userId = attributes['sub'];
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario (sub) desde Cognito.');
      }

      // 3. Mapear los datos a nuestra interfaz Jugador
      this.currentUser = {
        id: userId,
        nombre: cognitoUser.username,
        esHost: false, // Se determinará más adelante
        configurado: false,
      };

      // 4. Una vez que tenemos el usuario, ejecutamos la lógica de la sala
      this.setupLobby();
    } catch (err) {
      console.error('Error al obtener el usuario actual:', err);
      this.router.navigate(['/login']);
    }
  }

  private loadRoomDetails(roomCode: string): void {
    this.roomsService.getRoom(roomCode).subscribe({
      next: (salaData) => {
        this.sala = salaData;
        this.jugadores = salaData.jugadores;
        this.maxJugadores = salaData.maxJugadores || 4; // Usa maxJugadores del backend, por defecto 4

        // Verifica si el usuario actual ya está en la sala
        const userInRoom = this.currentUser && this.jugadores.some(j => j.id === this.currentUser!.id);

        if (!userInRoom && !this.esHost) { // Si no es host y no está en la sala, intenta unirse
          this.joinCurrentPlayerToRoom(roomCode);
        } else {
          // Si es host, o ya está en la sala, asegura que el estado de host del usuario actual sea correcto
          const selfPlayer = this.currentUser && this.jugadores.find(j => j.id === this.currentUser!.id);
          if (selfPlayer) {
            selfPlayer.esHost = this.esHost; // Actualiza el estado de host para el usuario actual en el array local
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar detalles de la sala:', err);
        // Maneja el error, por ejemplo, redirige al dashboard o muestra un mensaje
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private joinCurrentPlayerToRoom(roomCode: string): void {
    if (!this.currentUser) {
      console.error("Intento de unirse a sala sin un usuario actual.");
      return;
    }

    // Prepara los datos del jugador para enviar al backend
    const playerToJoin = {
      id: this.currentUser.id,
      nombre: this.currentUser.nombre
    };

    this.roomsService.joinRoom(roomCode, playerToJoin ).subscribe({
      next: (response) => {
        if (response.success) {
          this.sala = response.sala;
          this.jugadores = response.sala.jugadores;
          console.log('Se unió a la sala exitosamente:', this.sala);
        } else if (response.message) { // El backend puede enviar un mensaje de error
          console.error('Fallo al unirse a la sala:', response.message);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error al unirse a la sala:', err);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  private setupLobby(): void {
    this.codigoSala = this.route.snapshot.queryParams['codigo'] || '';
    this.esHost = this.route.snapshot.queryParams['host'] === 'true';

    if (this.codigoSala) {
      this.loadRoomDetails(this.codigoSala);
    } else if (this.esHost) {
      // Si el componente se carga como host pero sin código de sala,
      // significa que el componente 'configurar-sala' debería haber creado la sala y navegado aquí.
      // Redirigimos para asegurar el flujo correcto.
      console.warn('LobbyComponent cargado como host sin roomCode. Redirigiendo a configurar-sala.');
      this.router.navigate(['/configurar-sala']);
    } else {
      // Si no hay código de sala y no es host, es un estado inesperado.
      console.error('LobbyComponent cargado sin roomCode y sin ser host. Redirigiendo a dashboard.');
      this.router.navigate(['/dashboard']);
    }
  }

  getSlotsVacios(): any[] {
    const slotsVacios = this.maxJugadores - this.jugadores.length;
    return new Array(slotsVacios > 0 ? slotsVacios : 0); // Asegura que no sea negativo
  }

  getDificultadIcon(dificultad: string | undefined): string {
    if (!dificultad) return '';
    const icons = {
      'baby': '🍼',
      'conocedor': '🧠',
      'killer': '💀'
    };
    return icons[dificultad as keyof typeof icons] || '';
  }

  getDistribucionPreguntas(): string {
    const numJugadores = this.jugadores.length;
    if (numJugadores === 0) return '';
    
    const preguntasPorJugador = Math.floor(this.TOTAL_PREGUNTAS_PARTIDA / numJugadores);
    const preguntasExtra = this.TOTAL_PREGUNTAS_PARTIDA % numJugadores;
    
    if (preguntasExtra === 0) {
      return `${preguntasPorJugador} preguntas por jugador`;
    } else {
      return `${preguntasPorJugador}-${preguntasPorJugador + 1} preguntas por jugador`;
    }
  }

  getTematicasConfiguradas(): string[] {
    return this.jugadores
      .filter(j => j.configurado && j.tematica)
      .map(j => j.tematica!)
      .filter((tema, index, arr) => arr.indexOf(tema) === index);
  }

  todosListos(): boolean {
    return this.jugadores.length >= this.MIN_JUGADORES_PARA_INICIAR &&
           this.jugadores.every(j => j.configurado);
  }

  copiarCodigo() {
    navigator.clipboard.writeText(this.codigoSala);
  }

  enviarInvitacion() {
    if (this.emailInvitacion.trim()) {
      console.log('Invitando a:', this.emailInvitacion);
      this.emailInvitacion = '';
    }
  }

  iniciarPartida() {
    if (this.todosListos()) {
      // TODO: Llamar al backend para iniciar el juego (ej. roomsService.startGame(this.codigoSala))
      this.router.navigate(['/juego'], { 
        queryParams: { codigo: this.codigoSala } 
      });
    }
  }

  salirSala() {
    // TODO: Llamar al backend para salir de la sala (ej. roomsService.leaveRoom(this.codigoSala, this.currentUser.id))
    this.router.navigate(['/dashboard']);
  }
}