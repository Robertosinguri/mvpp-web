import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ConfiguracionEntrenamiento {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer' | '';
}

interface EstadisticasUsuario {
  partidasJugadas: number;
  mejorPuntaje: number;
  promedio: number;
  posicionRanking: number;
  temasRecientes: string[];
}

@Component({
  selector: 'app-entrenamiento',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './entrenamiento.html',
  styleUrls: ['./entrenamiento.scss']
})
export class EntrenamientoComponent implements OnInit {
  configuracion: ConfiguracionEntrenamiento = {
    tematica: '',
    dificultad: ''
  };

  sugerenciasTematicas: string[] = [
    'deportes', 'historia', 'ciencia', 'música', 
    'cine', 'tecnología', 'cocina', 'arte'
  ];

  estadisticas: EstadisticasUsuario = {
    partidasJugadas: 0,
    mejorPuntaje: 0,
    promedio: 0,
    posicionRanking: 0,
    temasRecientes: []
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.estadisticas = {
      partidasJugadas: 12,
      mejorPuntaje: 4,
      promedio: 3.2,
      posicionRanking: 47,
      temasRecientes: ['deportes', 'historia', 'tecnología']
    };
  }

  seleccionarSugerencia(sugerencia: string) {
    this.configuracion.tematica = sugerencia;
  }

  tematicaInvalida: boolean = false;

  validarTematica(event: any) {
    const valor = event.target.value;
    const palabras = this.contarPalabras(valor);
    this.tematicaInvalida = palabras > 3;
    
    if (this.tematicaInvalida) {
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
           this.contarPalabras(this.configuracion.tematica) <= 3;
  }

  iniciarEntrenamiento() {
    if (!this.esConfiguracionValida()) return;

    this.router.navigate(['/juego'], { 
      queryParams: { 
        modo: 'entrenamiento',
        tema: this.configuracion.tematica,
        dificultad: this.configuracion.dificultad
      } 
    });
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }
}