import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

interface NorthWindThemeApi {
  get(): Theme;
  toggle(): Theme;
}

/** Wraps public/js/theme.js (the same script the Blazor client uses). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly api = (window as unknown as { northWindTheme?: NorthWindThemeApi }).northWindTheme;

  readonly isDark = signal(this.api?.get() === 'dark');

  toggle(): void {
    const theme = this.api?.toggle() ?? (this.isDark() ? 'light' : 'dark');
    this.isDark.set(theme === 'dark');
  }
}
