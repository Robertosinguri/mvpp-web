import { Injectable, signal } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { COGNITO_CONFIG } from './cognito-config';

export interface AuthUser {
  username: string;
  email?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignUpData {
  username: string;
  password: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CognitoAuthService {
  private readonly isAuthenticated = signal(false);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly isLoading = signal(false);
  private readonly error = signal<string | null>(null);

  readonly isAuthenticated$ = this.isAuthenticated.asReadonly();
  readonly currentUser$ = this.currentUser.asReadonly();
  readonly isLoading$ = this.isLoading.asReadonly();
  readonly error$ = this.error.asReadonly();

  constructor() {
    this.configureAmplify();
    this.checkAuthState();
  }

  private configureAmplify(): void {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: COGNITO_CONFIG.userPoolId,
          userPoolClientId: COGNITO_CONFIG.userPoolClientId
        }
      }
    });
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const result = await signIn({
        username: credentials.username,
        password: credentials.password
      });

      if (result.isSignedIn) {
        await this.loadCurrentUser();
        return true;
      }
      return false;
    } catch (error: any) {
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    this.isLoading.set(true);
    try {
      await signOut();
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    } catch (error: any) {
      this.error.set(this.getErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  async signUp(userData: SignUpData): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await signUp({
        username: userData.username,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            name: userData.name
          }
        }
      });
      return true;
    } catch (error: any) {
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async confirmSignUp(username: string, code: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      await confirmSignUp({
        username,
        confirmationCode: code
      });
      return true;
    } catch (error: any) {
      this.error.set(this.getErrorMessage(error));
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendConfirmationCode(username: string): Promise<boolean> {
    try {
      await resendSignUpCode({ username });
      return true;
    } catch (error: any) {
      this.error.set(this.getErrorMessage(error));
      return false;
    }
  }

  private async checkAuthState(): Promise<void> {
    try {
      await this.loadCurrentUser();
    } catch {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const user = await getCurrentUser();
      this.currentUser.set({
        username: user.username,
        email: user.signInDetails?.loginId
      });
      this.isAuthenticated.set(true);
    } catch (error) {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      throw error;
    }
  }

  private getErrorMessage(error: any): string {
    const errorMap: Record<string, string> = {
      'NotAuthorizedException': 'Credenciales incorrectas',
      'UserNotConfirmedException': 'Usuario no confirmado. Revisa tu email',
      'UserNotFoundException': 'Usuario no encontrado',
      'InvalidPasswordException': 'Contraseña inválida',
      'UsernameExistsException': 'Este email ya está registrado',
      'InvalidParameterException': 'Parámetros inválidos. Verifica los datos',
      'CodeMismatchException': 'Código de confirmación incorrecto',
      'ExpiredCodeException': 'Código expirado. Solicita uno nuevo',
      'LimitExceededException': 'Demasiados intentos. Espera un momento',
      'TooManyRequestsException': 'Demasiadas solicitudes. Intenta más tarde'
    };

    if (error.message?.includes('Password did not conform')) {
      return 'La contraseña no cumple los requisitos';
    }

    return errorMap[error.name] || error.message || 'Error de autenticación';
  }

  clearError(): void {
    this.error.set(null);
  }
}