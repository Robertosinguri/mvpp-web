import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

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
  imports: [FormsModule, CommonModule, GamingNeonBackgroundComponent],
  templateUrl: './configurar-sala.html',
  styleUrls: ['./configurar-sala.scss']
})
export class ConfigurarSalaComponent implements OnInit {
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
    private route: ActivatedRoute
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

  crearSala() {
    if (!this.esConfiguracionValida()) return;

    // TODO: Crear sala en el backend
    const nuevaSala = {
      host: true,
      configuracion: this.configuracion,
      codigo: this.generarCodigo()
    };

    console.log('Creando sala:', nuevaSala);
    
    // Navegar al lobby como host
    this.router.navigate(['/lobby'], { 
      queryParams: { 
        codigo: nuevaSala.codigo, 
        host: true 
      } 
    });
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

  private generarCodigo(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  seleccionarSugerencia(sugerencia: string) {
    this.configuracion.tematica = sugerencia;
  }

  cargarInfoSala() {
    // Simular diferentes salas según el código
    const salasPrueba: { [key: string]: InfoSalaExistente } = {
      'ABC123': {
        codigo: 'ABC123',
        host: 'Carlos',
        jugadoresActuales: 2,
        maxJugadores: 4,
        jugadores: [
          { nombre: 'Carlos', tematica: 'deportes', dificultad: 'conocedor', esHost: true },
          { nombre: 'Ana', tematica: 'cocina', dificultad: 'baby', esHost: false }
        ]
      },
      'XYZ789': {
        codigo: 'XYZ789',
        host: 'María',
        jugadoresActuales: 3,
        maxJugadores: 4,
        jugadores: [
          { nombre: 'María', tematica: 'historia', dificultad: 'killer', esHost: true },
          { nombre: 'Pedro', tematica: 'tecnología', dificultad: 'conocedor', esHost: false },
          { nombre: 'Luis', tematica: 'música', dificultad: 'baby', esHost: false }
        ]
      },
      'TEST01': {
        codigo: 'TEST01',
        host: 'Sofia',
        jugadoresActuales: 1,
        maxJugadores: 3,
        jugadores: [
          { nombre: 'Sofia', tematica: 'arte', dificultad: 'conocedor', esHost: true }
        ]
      },
      'DEMO99': {
        codigo: 'DEMO99',
        host: 'Alex',
        jugadoresActuales: 2,
        maxJugadores: 2,
        jugadores: [
          { nombre: 'Alex', tematica: 'ciencia', dificultad: 'killer', esHost: true },
          { nombre: 'Emma', tematica: 'literatura', dificultad: 'conocedor', esHost: false }
        ]
      }
    };
    
    this.infoSalaExistente = salasPrueba[this.codigoSala] || salasPrueba['ABC123'];
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}