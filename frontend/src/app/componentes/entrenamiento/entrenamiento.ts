import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { NavbarComponent } from '../navbar/navbar';

interface ConfiguracionEntrenamiento {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer' | '';
}

@Component({
  selector: 'app-entrenamiento',
  standalone: true,
  imports: [FormsModule, CommonModule, bkgComponent, NavbarComponent],
  templateUrl: './entrenamiento.html',
  styleUrls: ['./entrenamiento.scss']
})
export class EntrenamientoComponent {
  configuracion: ConfiguracionEntrenamiento = {
    tematica: '',
    dificultad: ''
  };

  sugerenciasTematicas: string[] = [
    'deportes', 'historia', 'ciencia', 'música', 
    'cine', 'tecnología', 'cocina', 'arte'
  ];

  constructor(
    private router: Router
  ) {}

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


}
