import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EstadisticasService, JugadorRanking } from '../../servicios/estadisticas/estadisticas.service';
import { NavbarComponent } from '../navbar/navbar';
import { bkgComponent } from '../background/background';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, NavbarComponent, bkgComponent],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.scss']
})
export class RankingComponent implements OnInit {
  ranking: JugadorRanking[] | null = null;

  constructor(
    private estadisticasService: EstadisticasService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🏆 RANKING COMPONENT - Iniciando carga de datos');
    console.log('🔗 URL del servicio:', 'http://localhost:3000/api/estadisticas/ranking');
    
    this.estadisticasService.obtenerRankingGlobal(20).subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos del servidor:', data);
        console.log('📊 Tipo de datos:', typeof data);
        console.log('📊 Es array?:', Array.isArray(data));
        console.log('📊 Longitud:', data?.length);
        
        if (data && Array.isArray(data) && data.length > 0) {
          this.ranking = data;
          console.log('✅ Ranking asignado correctamente');
          console.log('📊 Datos del primer jugador:', data[0]);
          this.cdr.detectChanges(); // Forzar detección de cambios
        } else {
          console.log('⚠️ No hay datos de ranking o array vacío');
          this.ranking = [];
        }
      },
      error: (error) => {
        console.error('❌ Error cargando ranking:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        this.ranking = [];
      }
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  trackByPosition(index: number, jugador: JugadorRanking): number {
    return jugador.posicion;
  }


}
