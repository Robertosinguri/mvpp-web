import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { NavbarComponent } from '../navbar/navbar';
import { EstadisticasService, JugadorRanking } from '../../servicios/estadisticas/estadisticas.service';


interface ConfiguracionJuego {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer';
  jugadores?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavbarComponent, bkgComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  codigoSala: string = '';
  codigoSalaValido: boolean = true;
  rankingMinimalista: JugadorRanking[] | null = null;

  constructor(
    private router: Router,
    private estadisticasService: EstadisticasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarRankingMinimalista();
  }



  private cargarRankingMinimalista(): void {
    console.log('🏠 DASHBOARD - Cargando mini ranking...');
    
    this.estadisticasService.obtenerRankingGlobal(3).subscribe({
      next: (ranking) => {
        console.log('🏠 DASHBOARD - Mini ranking recibido:', ranking);
        this.rankingMinimalista = ranking;
        
        if (ranking && ranking.length > 0) {
          console.log('✅ Mini ranking cargado correctamente:', ranking.length, 'jugadores');
        } else {
          console.log('⚠️ Mini ranking vacío o null');
        }
        
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (error) => {
        console.error('❌ Error cargando mini ranking:', error);
        this.rankingMinimalista = [];
      }
    });
  }

  crearSala() {
    this.router.navigate(['/crear-sala']);
  }

  validarCodigoSala() {
    const codigo = this.codigoSala.trim().toUpperCase();
    // Formato: 6 caracteres alfanuméricos (letras y números)
    const formatoValido = /^[A-Z0-9]{6}$/.test(codigo);
    this.codigoSalaValido = formatoValido || codigo === '';
  }

  unirseASala() {
    const codigo = this.codigoSala.trim().toUpperCase();
    
    if (!codigo) {
      return;
    }
    
    // Validar formato antes de navegar
    if (!/^[A-Z0-9]{6}$/.test(codigo)) {
      this.codigoSalaValido = false;
      return;
    }
    
    this.codigoSalaValido = true;
    this.router.navigate(['/unirse-sala'], { 
      queryParams: { codigo: codigo } 
    });
  }

  iniciarEntrenamiento() {
    this.router.navigate(['/entrenamiento']);
  }

  navegarA(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }


}