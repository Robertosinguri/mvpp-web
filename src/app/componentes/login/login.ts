import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * Componente de login del sistema MVPP Web
 * Maneja la autenticación de usuarios
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  // Señales reactivas para el estado del formulario
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  /**
   * Maneja el envío del formulario de login
   */
  protected onSubmit(): void {
    if (!this.username() || !this.password()) {
      this.errorMessage.set('Por favor, completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Simulación de autenticación
    setTimeout(() => {
      if (this.username() === 'admin' && this.password() === 'admin') {
        console.log('Login exitoso');
        // Aquí iría la lógica de navegación
      } else {
        this.errorMessage.set('Credenciales inválidas');
      }
      this.isLoading.set(false);
    }, 1500);
  }

  /**
   * Actualiza el valor del username
   */
  protected onUsernameChange(value: string): void {
    this.username.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  /**
   * Actualiza el valor del password
   */
  protected onPasswordChange(value: string): void {
    this.password.set(value);
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }
}
