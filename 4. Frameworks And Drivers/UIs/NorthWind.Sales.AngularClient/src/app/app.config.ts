import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AppSettingsService } from './core/config/app-settings.service';

/**
 * Composition root of the Angular client (what Program.cs + AddNorthWindSalesServices
 * do in Blazor): router, HttpClient with the bearer-token interceptor and the
 * Web API address read from public/appsettings.json.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => inject(AppSettingsService).load()),
  ],
};
