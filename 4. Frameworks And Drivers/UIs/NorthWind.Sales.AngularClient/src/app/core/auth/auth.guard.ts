import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Angular version of [Authorize] on the Blazor pages: without a valid session
 * the user goes to the login page and comes back to the requested page.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.accessToken) {
    return true;
  }
  return inject(Router).createUrlTree(['/user/login'], {
    queryParams: { returnUrl: state.url },
  });
};
