import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Angular version of MembershipBearerTokenHandler: adds
 * "Authorization: Bearer <token>" to every Web API request.
 * If the API answers 401 the session is no longer valid and is closed.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  const authorized = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorized).pipe(
    tap({
      error: (error: { status?: number }) => {
        if (token && error?.status === 401) {
          auth.logout();
        }
      },
    }),
  );
};
