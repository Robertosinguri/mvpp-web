import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EstadisticasService, JugadorRanking } from '../../servicios/estadisticas/estadisticas.service';
import { bkgComponent } from '../background/background';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, bkgComponent],
  templateUrl: './ranking.html',
  styleUrls: ['./ranking.scss']
})
export class RankingComponent implements OnInit {
  ranking: JugadorRanking[] | null = null;

  constructor(private estadisticasService: EstadisticasService, private router: Router) {}

  ngOnInit(): void {
    this.estadisticasService.obtenerRankingGlobal(20).subscribe(data => {
      this.ranking = data;
    });
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
