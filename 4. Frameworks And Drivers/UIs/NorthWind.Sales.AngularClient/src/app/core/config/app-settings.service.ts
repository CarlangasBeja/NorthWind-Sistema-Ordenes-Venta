import { Injectable } from '@angular/core';

/** Same shape as the Blazor client's wwwroot/appsettings.json. */
interface AppSettings {
  WebApiAddress: string;
}

/**
 * Reads public/appsettings.json when the application starts, so the Web API
 * address can be changed on another computer without rebuilding Angular.
 */
@Injectable({ providedIn: 'root' })
export class AppSettingsService {
  private webApiAddress = 'http://localhost:5254';

  async load(): Promise<void> {
    try {
      const response = await fetch('appsettings.json', { cache: 'no-store' });
      if (response.ok) {
        const settings = (await response.json()) as Partial<AppSettings>;
        if (settings.WebApiAddress) {
          this.webApiAddress = settings.WebApiAddress.replace(/\/+$/, '');
        }
      }
    } catch {
      // Keeps the default address; the pages show a clear message if the API is unreachable.
    }
  }

  /** Absolute URL for an API route, for example url('/user/login'). */
  url(route: string): string {
    return `${this.webApiAddress}${route}`;
  }
}
