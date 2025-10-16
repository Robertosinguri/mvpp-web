import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeminiService, Pregunta, ConfiguracionJuego } from '../../servicios/gemini/gemini';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

type EstadoJuego = 'cargando' | 'jugando' | 'finalizado';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule, GamingNeonBackgroundComponent],
  templateUrl: './juego.html',
  styleUrls: ['./juego.scss']
})
export class JuegoComponent implements OnInit, OnDestroy {
  // Configuración del juego
  modoJuego: 'entrenamiento' | 'multijugador' = 'entrenamiento';
  tematica: string = '';
  dificultad: 'baby' | 'conocedor' | 'killer' = 'baby';
  
  // Estado del juego
  estadoJuego: EstadoJuego = 'cargando';
  preguntas: Pregunta[] = [];
  preguntaActual: number = 0;
  totalPreguntas: number = 5;
  
  // Estado de la pregunta actual
  preguntaActualObj: Pregunta | null = null;
  respuestaSeleccionada: number | null = null;
  mostrarRespuesta: boolean = false;
  respuestaCorrecta: boolean = false;
  
  // Puntaje y tiempo
  puntaje: number = 0;
  tiempoRestante: number = 30;
  tiempoInicio: number = 0;
  timerInterval: any;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private geminiService: GeminiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarConfiguracion();
    this.iniciarJuego();
  }

  ngOnDestroy() {
    this.limpiarTimer();
  }

  private cargarConfiguracion() {
    const params = this.route.snapshot.queryParams;
    this.modoJuego = params['modo'] || 'entrenamiento';
    this.tematica = params['tema'] || 'general';
    this.dificultad = params['dificultad'] || 'baby';
  }

  private async iniciarJuego() {
    this.estadoJuego = 'cargando';
    this.tiempoInicio = Date.now();
    
    const config: ConfiguracionJuego = {
      tematica: this.tematica,
      dificultad: this.dificultad,
      cantidadPreguntas: this.totalPreguntas
    };

    try {
      this.geminiService.generarPreguntas(config).subscribe({
        next: (preguntas) => {
          this.preguntas = preguntas;
          this.cargarPreguntaActual();
          this.estadoJuego = 'jugando';
          this.cdr.detectChanges();
          this.iniciarTimer();
        },
        error: (error) => {
          console.error('Error cargando preguntas:', error);
          this.preguntas = this.generarPreguntasFallback(config);
          this.cargarPreguntaActual();
          this.estadoJuego = 'jugando';
          this.cdr.detectChanges();
          this.iniciarTimer();
        }
      });
    } catch (error) {
      console.error('Error iniciando juego:', error);
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
      this.finalizarJuego();
    } else {
      this.preguntaActual++;
      this.cargarPreguntaActual();
      this.iniciarTimer();
    }
  }

  private finalizarJuego() {
    this.limpiarTimer();
    this.estadoJuego = 'finalizado';
  }

  esUltimaPregunta(): boolean {
    return this.preguntaActual >= this.totalPreguntas - 1;
  }

  get progreso(): number {
    return ((this.preguntaActual + 1) / this.totalPreguntas) * 100;
  }

  getLetraOpcion(indice: number): string {
    return String.fromCharCode(65 + indice); // A, B, C, D
  }

  getPorcentaje(): number {
    return Math.round((this.puntaje / this.totalPreguntas) * 100);
  }

  getMensajeRendimiento(): string {
    const porcentaje = this.getPorcentaje();
    
    if (porcentaje >= 90) return '¡Excelente! 🌟';
    if (porcentaje >= 70) return '¡Muy bien! 👏';
    if (porcentaje >= 50) return 'Bien hecho 👍';
    if (porcentaje >= 30) return 'Puedes mejorar 💪';
    return 'Sigue practicando 📚';
  }

  getTiempoTotal(): string {
    const tiempoTotal = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const minutos = Math.floor(tiempoTotal / 60);
    const segundos = tiempoTotal % 60;
    
    if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    }
    return `${segundos}s`;
  }

  jugarDeNuevo() {
    // Reiniciar el juego con la misma configuración
    this.preguntaActual = 0;
    this.puntaje = 0;
    this.iniciarJuego();
  }

  private generarPreguntasFallback(config: ConfiguracionJuego): Pregunta[] {
    return [
      {
        pregunta: `¿Estás listo para responder preguntas sobre ${this.tematica}?`,
        opciones: ['Sí, estoy listo', 'Necesito más tiempo', 'No estoy seguro', 'Vamos a intentarlo'],
        respuestaCorrecta: 0,
        tematica: this.tematica,
        dificultad: this.dificultad
      },
      {
        pregunta: `¿Qué nivel de conocimiento tienes sobre ${this.tematica}?`,
        opciones: ['Básico', 'Intermedio', 'Avanzado', 'Experto'],
        respuestaCorrecta: 1,
        tematica: this.tematica,
        dificultad: this.dificultad
      },
      {
        pregunta: `¿Dónde aprendiste sobre ${this.tematica}?`,
        opciones: ['Libros', 'Internet', 'Experiencia', 'Todas las anteriores'],
        respuestaCorrecta: 3,
        tematica: this.tematica,
        dificultad: this.dificultad
      },
      {
        pregunta: `¿${this.tematica} te parece interesante?`,
        opciones: ['Muy interesante', 'Algo interesante', 'Poco interesante', 'Nada interesante'],
        respuestaCorrecta: 0,
        tematica: this.tematica,
        dificultad: this.dificultad
      },
      {
        pregunta: `¿Recomendarías ${this.tematica} a otros?`,
        opciones: ['Definitivamente sí', 'Probablemente sí', 'Tal vez', 'No'],
        respuestaCorrecta: 0,
        tematica: this.tematica,
        dificultad: this.dificultad
      }
    ];
  }

  volverAlMenu() {
    if (this.modoJuego === 'entrenamiento') {
      this.router.navigate(['/entrenamiento']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}