import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

interface ConfiguracionJuego {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer';
  jugadores?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, GamingNeonBackgroundComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  codigoSala: string = 'ABC123'; // Código de prueba precargado

  constructor(
    private router: Router,
    private cognitoAuth: CognitoAuthService
  ) {}

  ngOnInit() {
    const user = this.cognitoAuth.currentUser$();
    if (user) {
      this.userName = user.username || 'Usuario';
    } else {
      this.router.navigate(['/login']);
    }
  }

  crearSala() {
    this.router.navigate(['/crear-sala']);
  }

  unirseASala() {
    const codigo = this.codigoSala.trim();
    
    if (codigo) {
      this.router.navigate(['/unirse-sala'], { 
        queryParams: { codigo: codigo.toUpperCase() } 
      });
    }
  }

  iniciarEntrenamiento() {
    this.router.navigate(['/entrenamiento']);
  }

  verAbout() {
    this.router.navigate(['/about']);
  }

  async logout() {
    try {
      await this.cognitoAuth.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}