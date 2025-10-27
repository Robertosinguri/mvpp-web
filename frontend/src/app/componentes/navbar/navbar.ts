import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { EstadisticasService, EstadisticasUsuario } from '../../servicios/estadisticas/estadisticas.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  showStats = false;
  estadisticas: EstadisticasUsuario | null = null;

  constructor(
    private router: Router,
    private authService: CognitoAuthService,
    private estadisticasService: EstadisticasService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  getUserName(): string {
    const user = this.authService.currentUser$();
    // Priorizar el atributo 'name' de Cognito, luego email, luego username
    return user?.name || user?.email?.split('@')[0] || user?.username || 'Usuario';
  }

  getUserEmail(): string {
    const user = this.authService.currentUser$();
    return user?.email || '';
  }

  private cargarEstadisticas(): void {
    const user = this.authService.currentUser$();
    if (!user) return;

    // Usar el email como userId y el nombre como username
    const userId = user.email || user.username;
    const username = this.getUserName(); // Obtener el nombre normalizado
    
    if (userId) {
      console.log('📊 Navbar cargando estadísticas:', { userId, username });
      this.estadisticasService.obtenerEstadisticasPersonales(userId, username).subscribe(stats => {
        if (stats) {
          this.estadisticas = stats;
          console.log('📊 Estadísticas cargadas en navbar:', stats);
        }
      });
    }
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}