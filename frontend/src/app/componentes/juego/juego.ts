import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GeminiService, Pregunta, ConfiguracionJuego } from '../../servicios/gemini/gemini';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { EstadisticasService, ResultadoJuego } from '../../servicios/estadisticas/estadisticas.service';
import { bkgComponent, } from '../background/background';

type EstadoJuego = 'cargando' | 'jugando' | 'finalizado';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule, bkgComponent],
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
    private authService: CognitoAuthService,
    private estadisticasService: EstadisticasService,
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
    this.dificultad = params['dificultad'] || 'baby';
    
    // Para multijugador, mostrar temática mixta en UI
    if (params['tematicas'] && this.modoJuego === 'multijugador') {
      const tematicas = params['tematicas'].split(',').filter((t: string) => t.trim());
      if (tematicas.length > 1) {
        this.tematica = `Preguntas mixtas: ${tematicas.join(' + ')}`;
      } else {
        this.tematica = tematicas[0] || 'general';
      }
    } else {
      this.tematica = params['tema'] || 'general';
    }
    
    console.log('=== CONFIGURACIÓN CARGADA ===');
    console.log('Modo:', this.modoJuego);
    console.log('Temática para UI:', this.tematica);
    console.log('Dificultad:', this.dificultad);
    console.log('Parámetros completos:', params);
  }

  private async iniciarJuego() {
    this.estadoJuego = 'cargando';
    this.tiempoInicio = Date.now();
    
    // El componente Juego solo maneja entrenamiento
    // El multijugador va directamente a Arena desde Lobby
    await this.generarPreguntasEntrenamiento();
  }

  private async generarPreguntasEntrenamiento() {
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
          this.mostrarErrorIA(error.message || 'Error generando preguntas');
        }
      });
    } catch (error) {
      console.error('Error iniciando juego:', error);
      this.mostrarErrorIA('Error crítico iniciando el juego');
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
      this.finalizarJuego();
    } else {
      this.preguntaActual++;
      this.cargarPreguntaActual();
      this.iniciarTimer();
    }
  }

  private async finalizarJuego() {
    this.limpiarTimer();
    
    // Guardar resultado para entrenamiento
    if (this.modoJuego === 'entrenamiento') {
      await this.guardarResultadoEntrenamiento();
    }
    
    if (this.modoJuego === 'multijugador') {
      // Navegar a resultados multijugador
      this.router.navigate(['/resultados'], {
        queryParams: {
          roomCode: this.route.snapshot.queryParams['roomCode'],
          tema: this.tematica,
          dificultad: this.dificultad,
          puntaje: this.puntaje,
          tiempo: Math.floor((Date.now() - this.tiempoInicio) / 1000)
        }
      });
    } else {
      // Mostrar resultados en el mismo componente para entrenamiento
      this.estadoJuego = 'finalizado';
    }
  }

  private async guardarResultadoEntrenamiento() {
    try {
      const usuario = this.authService.usuarioActual();
      if (!usuario?.email) {
        console.log('No hay usuario autenticado, no se guarda resultado');
        return;
      }

      const resultado: ResultadoJuego = {
        userId: usuario.email,
        tematica: this.tematica,
        dificultad: this.dificultad,
        puntaje: this.puntaje,
        respuestasCorrectas: this.puntaje,
        totalPreguntas: this.totalPreguntas,
        tiempoTotal: Math.floor((Date.now() - this.tiempoInicio) / 1000),
        fecha: new Date()
      };
      
      this.estadisticasService.guardarResultadoPartida(resultado).subscribe({
        next: (response) => {
          console.log('📊 Resultado entrenamiento guardado:', response);
        },
        error: (error) => {
          console.error('❌ Error guardando resultado entrenamiento:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error guardando resultado entrenamiento:', error);
    }
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

  private mostrarErrorIA(mensaje: string) {
    this.estadoJuego = 'finalizado';
    // Mostrar mensaje de error en lugar de preguntas fallback
    alert(`❌ Error: ${mensaje}\n\nEl servicio de IA no está disponible en este momento. Por favor, intenta más tarde.`);
    this.volverAlMenu();
  }

  volverAlMenu() {
    this.router.navigate(['/entrenamiento']);
  }

  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}