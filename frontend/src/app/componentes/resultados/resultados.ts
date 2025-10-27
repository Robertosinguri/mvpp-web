import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { bkgComponent } from '../background/background';
import { EstadisticasService, JugadorRanking } from '../../servicios/estadisticas/estadisticas.service';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';

interface ResultadoJugador {
  userId: string;
  username: string;
  puntaje: number;
  tiempoTotal: number;
  porcentaje: number;
  posicion: number;
}

interface JugadorGlobal {
  userId: string;
  username: string;
  puntosTotales: number;
  posicion: number;
  esMiPosicion: boolean;
}

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, bkgComponent],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss']
})
export class ResultadosComponent implements OnInit {
  resultados: ResultadoJugador[] = [];
  ganador: ResultadoJugador | null = null;
  miResultado: ResultadoJugador | null = null;
  rankingGlobal: JugadorGlobal[] = [];
  roomCode: string = '';
  tematica: string = '';
  dificultad: string = '';
  miUserId: string = '';
  nombreUsuarioActual: string = 'Mi Usuario';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private estadisticasService: EstadisticasService,
    private authService: CognitoAuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargarResultados();
  }

  private async cargarResultados() {
    const params = this.route.snapshot.queryParams;
    this.roomCode = params['roomCode'] || 'TEST123';
    this.tematica = params['tema'] || 'Deportes';
    this.dificultad = params['dificultad'] || 'conocedor';
    
    // Obtener nombre real del usuario actual
    try {
      const user = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      this.nombreUsuarioActual = attributes.name || user.username || 'Mi Usuario';
      console.log('👤 Nombre usuario actual:', this.nombreUsuarioActual);
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      this.nombreUsuarioActual = 'Mi Usuario';
    }
    
    // Obtener resultados reales del localStorage (guardados por arena)
    const rankingGuardado = localStorage.getItem('ranking-partida');
    const ganadorGuardado = localStorage.getItem('ganador-partida');
    
    if (rankingGuardado) {
      try {
        this.resultados = JSON.parse(rankingGuardado);
        console.log('✅ Ranking real cargado:', this.resultados.length, 'jugadores');
        
        if (ganadorGuardado) {
          this.ganador = JSON.parse(ganadorGuardado);
          console.log('🏆 Ganador cargado:', this.ganador?.username);
        }
      } catch (error) {
        console.error('Error parseando datos guardados:', error);
        this.crearDatosFallback();
      }
    } else {
      console.log('⚠️ No hay datos guardados, usando fallback');
      this.crearDatosFallback();
    }

    this.ganador = this.resultados[0];
    this.miResultado = this.resultados.find(r => r.username === this.nombreUsuarioActual) || null;
    
    console.log('🔍 Buscando mi resultado para:', this.nombreUsuarioActual);
    console.log('🔍 Mi resultado encontrado:', this.miResultado);
    
    console.log('🎮 RESULTADOS - Datos cargados:');
    console.log('- Resultados:', this.resultados);
    console.log('- Ganador:', this.ganador);
    console.log('- Mi resultado:', this.miResultado);
    console.log('- Room code:', this.roomCode);
    console.log('- Temática:', this.tematica);
    console.log('- Dificultad:', this.dificultad);
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Obtener ID del usuario actual y cargar ranking
    this.cargarUsuarioYRanking();
  }

  getMedalla(posicion: number): string {
    switch(posicion) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return minutos > 0 ? `${minutos}m ${segs}s` : `${segs}s`;
  }

  private async cargarUsuarioYRanking() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      const attributes = await this.authService.getUserAttributes();
      
      // Usar el mismo username que se guarda en las estadísticas
      this.miUserId = currentUser?.username || 'user1';
      
      console.log('🔑 Usuario actual info:');
      console.log('- Username:', currentUser?.username);
      console.log('- Sub:', attributes?.sub);
      console.log('- Name:', attributes?.name);
      console.log('- Usando para búsqueda:', this.miUserId);
      
      // Ahora cargar el ranking con el ID correcto
      this.cargarRankingGlobal();
    } catch (error) {
      console.error('❌ Error obteniendo usuario actual:', error);
      this.miUserId = 'user1';
      this.cargarRankingGlobal();
    }
  }

  private cargarRankingGlobal() {
    console.log('🏆 RESULTADOS - Cargando ranking global (mismo que dashboard)...');
    
    // Usar exactamente el mismo servicio que el dashboard
    this.estadisticasService.obtenerRankingGlobal(4).subscribe({
      next: (rankingCompleto) => {
        if (rankingCompleto && rankingCompleto.length > 0) {
          console.log('📊 Ranking recibido (igual que dashboard):', rankingCompleto.length, 'jugadores');
          
          // Convertir directamente a formato JugadorGlobal sin modificaciones
          this.rankingGlobal = rankingCompleto.map((jugador) => ({
            userId: jugador.userId,
            username: jugador.nombre,
            puntosTotales: jugador.puntajeTotal,
            posicion: jugador.posicion,
            esMiPosicion: jugador.nombre === this.nombreUsuarioActual
          }));
          
          console.log('✅ Ranking global cargado (idéntico al dashboard):', this.rankingGlobal);
          this.cdr.detectChanges();
        } else {
          console.log('⚠️ Ranking vacío');
          this.rankingGlobal = [];
        }
      },
      error: (error) => {
        console.error('❌ Error cargando ranking global:', error);
        this.rankingGlobal = [];
      }
    });
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }

  trackByUserId(index: number, item: ResultadoJugador): string {
    return item.userId;
  }

  trackByGlobalUserId(index: number, item: JugadorGlobal): string {
    return item.userId;
  }

  private crearDatosFallback() {
    // Crear datos de fallback solo para el usuario actual
    this.resultados = [
      {
        userId: 'user1',
        username: this.nombreUsuarioActual,
        puntaje: 0,
        tiempoTotal: 0,
        porcentaje: 0,
        posicion: 1
      }
    ];
    
    this.ganador = this.resultados[0];
    console.log('⚠️ Usando datos de fallback');
  }
}