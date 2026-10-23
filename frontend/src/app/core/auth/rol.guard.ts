import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const rolGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as string[] | undefined;
  const userRol = authService.rol();

  if (rolesPermitidos && userRol && rolesPermitidos.includes(userRol)) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
