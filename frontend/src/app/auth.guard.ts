import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoAuthService } from './servicios/cognitoAuth/cognito-auth.service';

export const authGuard = () => {
  const authService = inject(CognitoAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated$()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};