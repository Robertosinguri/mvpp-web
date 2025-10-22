import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

interface Jugador {
  id: string;
  nombre: string;
  esHost: boolean;
  configurado: boolean;
  tematica?: string;
  dificultad?: 'baby' | 'conocedor' | 'killer';
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule, GamingNeonBackgroundComponent],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.scss']
})
export class LobbyComponent implements OnInit {
  codigoSala: string = '';
  esHost: boolean = false;
  maxJugadores: number = 4;
  emailInvitacion: string = '';
  
  jugadores: Jugador[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.codigoSala = this.route.snapshot.queryParams['codigo'] || '';
    this.esHost = this.route.snapshot.queryParams['host'] === 'true';
    
    // Simular datos de jugadores para demo
    this.cargarJugadores();
  }

  cargarJugadores() {
    this.jugadores = [
      {
        id: '1',
        nombre: 'Juan (Tú)',
        esHost: this.esHost,
        configurado: true,
        tematica: 'deportes',
        dificultad: 'conocedor'
      },
      {
        id: '2',
        nombre: 'María',
        esHost: false,
        configurado: false
      }
    ];
  }

  getSlotsVacios(): any[] {
    const slotsVacios = this.maxJugadores - this.jugadores.length;
    return new Array(slotsVacios);
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
    
    const preguntasPorJugador = Math.floor(5 / numJugadores);
    const preguntasExtra = 5 % numJugadores;
    
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
    return this.jugadores.length >= 2 && 
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
      this.router.navigate(['/juego'], { 
        queryParams: { codigo: this.codigoSala } 
      });
    }
  }

  salirSala() {
    this.router.navigate(['/dashboard']);
  }
}