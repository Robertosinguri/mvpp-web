import { Injectable, signal } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, signUp, confirmSignUp, resendSignUpCode, fetchUserAttributes } from 'aws-amplify/auth';
import { COGNITO_CONFIG } from './cognito-config';

export interface AuthUser {
  username: string;
  name?: string;
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
      // Si hay una sesión activa, cerrarla e intentar de nuevo
      if (error.message?.includes('There is already a signed in user')) {
        try {
          await signOut();
          // Intentar login nuevamente después de cerrar sesión
          const retryResult = await signIn({
            username: credentials.username,
            password: credentials.password
          });
          
          if (retryResult.isSignedIn) {
            await this.loadCurrentUser();
            return true;
          }
        } catch (retryError: any) {
          this.error.set(this.getErrorMessage(retryError));
          return false;
        }
      }
      
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
        const [user, attributes] = await Promise.all([
        getCurrentUser(),
        fetchUserAttributes()
      ]);
      this.currentUser.set({
        username: user.username,
        name: attributes.name,
        email: attributes.email
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

    if (error.message?.includes('There is already a signed in user')) {
      return 'Ya hay una sesión activa. Cerrando sesión anterior...';
    }

    return errorMap[error.name] || error.message || 'Error de autenticación';
  }

  clearError(): void {
    this.error.set(null);
  }

  /**
   * Expone la función getCurrentUser de Amplify para ser usada por otros componentes.
   * Devuelve el objeto de usuario de Amplify.
   */
  public getCurrentUser() {
    return getCurrentUser();
  }

  /**
   * Expone la función fetchUserAttributes de Amplify.
   * Devuelve un objeto con los atributos del usuario.
   */
  public getUserAttributes() {
    return fetchUserAttributes();
  }

  /**
   * Devuelve el usuario actual desde el signal.
   */
  public usuarioActual() {
    return this.currentUser();
  }
}