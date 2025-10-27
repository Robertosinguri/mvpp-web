import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { RoomsService, Jugador, Sala } from '../../servicios/salas/rooms.service';
import { HttpClientModule } from '@angular/common/http';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { WebSocketService } from '../../servicios/websocket/websocket.service';

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
  sala: Sala | null = null;
  currentUser: Jugador | null = null;
  
  // Modal de configuración
  mostrarConfigModal = false;
  configuracionJugador = {
    tematica: '',
    dificultad: '' as 'baby' | 'conocedor' | 'killer' | ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private authService: CognitoAuthService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
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
    console.log('=== CARGANDO DETALLES DE SALA ===');
    console.log('Código de sala:', roomCode);
    this.roomsService.getRoom(roomCode).subscribe({
      next: (salaData) => {
        console.log('Datos de sala recibidos:', salaData);
        this.sala = salaData;
        this.jugadores = salaData.jugadores;
        this.maxJugadores = salaData.maxJugadores || 4; // Usa maxJugadores del backend, por defecto 4
        console.log('Jugadores asignados:', this.jugadores);
        console.log('Detalle completo de jugadores:');
        this.jugadores.forEach((j, i) => {
          console.log(`Jugador ${i + 1}:`, {
            nombre: j.nombre,
            configurado: j.configurado,
            tematica: j.tematica,
            dificultad: j.dificultad,
            esHost: j.esHost
          });
        });
        
        // Forzar detección de cambios después de cargar jugadores
        this.cdr.detectChanges();

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
    
    console.log('=== SETUP LOBBY ===');
    console.log('codigoSala asignado:', this.codigoSala);
    console.log('esHost:', this.esHost);
    
    // Forzar detección de cambios
    setTimeout(() => {
      console.log('Código después de timeout:', this.codigoSala);
      this.cdr.detectChanges();
    }, 0);

    if (this.codigoSala) {
      // Si es host, inicializar con datos básicos
      if (this.esHost && this.currentUser) {
        this.jugadores = [{
          id: this.currentUser.id,
          nombre: this.currentUser.nombre,
          esHost: true,
          configurado: false
        }];
      }
      this.loadRoomDetails(this.codigoSala);
      this.conectarWebSocket();
    } else {
      console.error('No hay código de sala');
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

  getDificultadMasComun(): string {
    const dificultades = this.jugadores
      .filter(j => j.configurado && j.dificultad)
      .map(j => j.dificultad!);
    
    if (dificultades.length === 0) return 'baby';
    
    // Contar frecuencias
    const frecuencias: {[key: string]: number} = {};
    dificultades.forEach(dif => {
      frecuencias[dif] = (frecuencias[dif] || 0) + 1;
    });
    
    // Encontrar la más común
    return Object.keys(frecuencias).reduce((a, b) => 
      frecuencias[a] > frecuencias[b] ? a : b
    );
  }

  todosListos(): boolean {
    // Si no hay jugadores cargados, no están listos
    if (!this.jugadores || this.jugadores.length === 0) {
      return false;
    }
    
    const suficientesJugadores = this.jugadores.length >= this.MIN_JUGADORES_PARA_INICIAR;
    const todosConfigurados = this.jugadores.every(j => j.configurado);
    
    return suficientesJugadores && todosConfigurados;
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

  enviarInvitacion() {
    if (this.emailInvitacion.trim()) {
      console.log('Invitando a:', this.emailInvitacion);
      this.emailInvitacion = '';
    }
  }

  iniciarPartida() {
    if (this.todosListos()) {
      console.log('=== INICIANDO PARTIDA ===');
      console.log('Código sala:', this.codigoSala);
      console.log('Jugadores:', this.jugadores.length);
      
      const tematicas = this.getTematicasConfiguradas();
      const dificultad = this.getDificultadMasComun();
      
      console.log('Temáticas configuradas:', tematicas);
      console.log('Dificultad seleccionada:', dificultad);
      
      // Emitir evento WebSocket para que todos naveguen a Arena
      this.webSocketService.socket.emit('start-game', { 
        roomCode: this.codigoSala,
        gameData: {
          roomCode: this.codigoSala,
          tematicas: tematicas.join(','),
          dificultad: dificultad,
          modo: 'multijugador'
        }
      });
      
      // El host también navega a Arena
      console.log('🏟️ NAVEGANDO A ARENA');
      console.log('Parámetros:', {
        roomCode: this.codigoSala,
        tematicas: tematicas.join(','),
        dificultad: dificultad
      });
      
      console.log('🚀 EJECUTANDO NAVEGACIÓN A /arena');
      this.router.navigate(['/arena'], { 
        queryParams: { 
          roomCode: this.codigoSala,
          tematicas: tematicas.join(','),
          dificultad: dificultad,
          modo: 'multijugador'
        } 
      }).then(
        success => console.log('✅ Navegación HOST exitosa:', success),
        error => console.error('❌ Error navegación HOST:', error)
      );
    }
  }

  salirSala() {
    this.router.navigate(['/dashboard']);
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  // Métodos del modal de configuración
  abrirConfiguracion(): void {
    this.mostrarConfigModal = true;
    this.configuracionJugador = { tematica: '', dificultad: '' };
  }

  cerrarConfiguracion(): void {
    this.mostrarConfigModal = false;
  }

  esConfiguracionValida(): boolean {
    return this.configuracionJugador.tematica.trim() !== '' && 
           this.configuracionJugador.dificultad !== '' &&
           this.configuracionJugador.tematica.trim().split(/\s+/).length <= 3;
  }

  guardarConfiguracion(): void {
    if (!this.esConfiguracionValida() || !this.currentUser) return;

    console.log('=== GUARDANDO CONFIGURACIÓN ===');
    console.log('Temática:', this.configuracionJugador.tematica);
    console.log('Dificultad:', this.configuracionJugador.dificultad);
    console.log('Usuario ID:', this.currentUser.id);

    this.roomsService.configurePlayer(
      this.codigoSala,
      this.currentUser.id,
      this.configuracionJugador.tematica.trim(),
      this.configuracionJugador.dificultad as 'baby' | 'conocedor' | 'killer'
    ).subscribe({
      next: (response) => {
        console.log('Respuesta configuración:', response);
        if (response.success) {
          this.sala = response.sala;
          this.jugadores = response.sala.jugadores;
          console.log('Jugadores actualizados:', this.jugadores);
          console.log('Estado detallado de jugadores:');
          this.jugadores.forEach((j, i) => {
            console.log(`Jugador ${i + 1}: ${j.nombre} - Configurado: ${j.configurado} - Temática: ${j.tematica}`);
          });
          
          // Emitir evento WebSocket para notificar configuración
          this.webSocketService.socket.emit('user-configured', {
            roomCode: this.codigoSala,
            userId: this.currentUser!.id
          });
          
          this.cerrarConfiguracion();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al guardar configuración:', err);
      }
    });
  }

  private async crearNuevaSala(): Promise<void> {
    console.log('Iniciando creación de sala...');
    
    if (!this.currentUser) {
      console.error('No hay usuario actual');
      this.router.navigate(['/dashboard']);
      return;
    }

    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      
      if (!user || !attributes['sub']) {
        console.error('Usuario no válido');
        this.router.navigate(['/dashboard']);
        return;
      }
      
      const roomData = {
        nombre: `${user.username}'s Game`,
        maxJugadores: 4,
        host: {
          id: attributes['sub'],
          nombre: user.username
        }
      };

      console.log('Enviando datos al backend:', roomData);

      this.roomsService.createRoom(roomData).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          if (response.success) {
            this.codigoSala = response.roomCode;
            this.sala = response.sala;
            this.jugadores = response.sala.jugadores;
            console.log('Sala creada exitosamente:', this.codigoSala);
            console.log('esHost:', this.esHost);
            console.log('Debería mostrar sección de código:', this.esHost && this.codigoSala);
            this.conectarWebSocket();
          } else {
            console.error('Error en respuesta:', response);
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.error('Error HTTP al crear sala:', err);
          this.router.navigate(['/dashboard']);
        }
      });
    } catch (error) {
      console.error('Error en crearNuevaSala:', error);
      this.router.navigate(['/dashboard']);
    }
  }

  private conectarWebSocket(): void {
    if (this.currentUser && this.codigoSala) {
      this.webSocketService.joinRoom(this.codigoSala, this.currentUser.id);
      
      this.webSocketService.onUserJoined().subscribe(() => {
        console.log('👤 Usuario se unió - Recargando sala');
        this.loadRoomDetails(this.codigoSala);
      });
      
      this.webSocketService.onUserLeft().subscribe(() => {
        console.log('👤 Usuario salió - Recargando sala');
        this.loadRoomDetails(this.codigoSala);
      });
      
      this.webSocketService.onUserConfigured().subscribe(() => {
        console.log('⚙️ Usuario configurado - Recargando sala');
        this.loadRoomDetails(this.codigoSala);
      });
      
      // Polling como respaldo cada 3 segundos
      setInterval(() => {
        if (this.codigoSala && !this.todosListos()) {
          console.log('🔄 Polling - Recargando sala');
          this.loadRoomDetails(this.codigoSala);
        }
      }, 3000);
      
      this.webSocketService.onGameStarted().subscribe((data) => {
        console.log('🏟️ Arena iniciada via WebSocket, navegando...', data);
        console.log('Parámetros WebSocket:', {
          roomCode: data.gameData.roomCode,
          tematicas: data.gameData.tematicas,
          dificultad: data.gameData.dificultad
        });
        
        console.log('🚀 EJECUTANDO NAVEGACIÓN WEBSOCKET A /arena');
        this.router.navigate(['/arena'], { 
          queryParams: {
            roomCode: data.gameData.roomCode,
            tematicas: data.gameData.tematicas,
            dificultad: data.gameData.dificultad,
            modo: data.gameData.modo
          }
        }).then(
          success => console.log('✅ Navegación WEBSOCKET exitosa:', success),
          error => console.error('❌ Error navegación WEBSOCKET:', error)
        );
      });
    }
  }
}