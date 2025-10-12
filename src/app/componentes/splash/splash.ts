import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

/**
* Componente de pantalla de bienvenida (splash screen)
* Muestra la animación de carga y redirige automáticamente al login
*/

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss'],
  standalone: true,
  imports: [CommonModule, GamingNeonBackgroundComponent]
})

export class SplashComponent implements OnInit, OnDestroy {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly SPLASH_DURATION = 12000; // 12 segundos

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.startSplashTimer();
  }

  ngOnDestroy(): void {
    this.clearSplashTimer();
  }

  /**
   * Inicia el temporizador para la navegación automática
   */
  private startSplashTimer(): void {
    this.timer = setTimeout(() => {
      this.navigateToLogin();
    }, this.SPLASH_DURATION);
  }

  /**
   * Limpia el temporizador si existe
   */
  private clearSplashTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * Navega a la página de login
   */
  private navigateToLogin(): void {
    this.router.navigate(['/login'], { replaceUrl: true })
      .catch(error => {
        console.error('Error al navegar al login:', error);
      });
  }
}
