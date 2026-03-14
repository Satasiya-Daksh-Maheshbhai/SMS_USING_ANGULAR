import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (expectedRole: UserRole): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasRole(expectedRole)) {
      return true;
    }

    return router.createUrlTree([expectedRole === 'admin' ? '/student' : '/admin']);
  };
};
