import { Injectable, computed, signal } from '@angular/core';
import { TokensDto } from '../models/sales.models';

interface JwtPayload {
  exp?: number;
  FullName?: string;
  [claim: string]: unknown;
}

const StorageKey = 'northwind.angular.tokens.v1';
const NameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

/**
 * Angular version of JWTAuthenticationStateProvider + TokenLocalStorage:
 * keeps the token in localStorage and exposes who is signed in.
 * An expired or unreadable token is discarded, like in the Blazor client.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(this.readStoredToken());

  readonly isAuthenticated = computed(() => this.token() !== null);

  readonly userName = computed(() => {
    const payload = this.payload();
    const fullName = payload?.FullName;
    const email = payload?.[NameClaim];
    return (typeof fullName === 'string' && fullName.trim()) ||
      (typeof email === 'string' && email) ||
      'Usuario';
  });

  readonly initials = computed(() => {
    const parts = this.userName().split(' ').filter((part) => part.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  });

  private readonly payload = computed(() => {
    const token = this.token();
    return token ? decodePayload(token) : null;
  });

  /** Current token, or null when there is none or it has expired. */
  get accessToken(): string | null {
    const token = this.token();
    if (token && isExpired(decodePayload(token))) {
      this.logout();
      return null;
    }
    return token;
  }

  login(tokens: TokensDto): void {
    localStorage.setItem(StorageKey, JSON.stringify(tokens));
    this.token.set(tokens.accessToken);
  }

  logout(): void {
    localStorage.removeItem(StorageKey);
    this.token.set(null);
  }

  private readStoredToken(): string | null {
    try {
      const value = localStorage.getItem(StorageKey);
      if (!value) return null;
      const tokens = JSON.parse(value) as Partial<TokensDto>;
      const token = tokens.accessToken ?? null;
      if (!token || isExpired(decodePayload(token))) {
        localStorage.removeItem(StorageKey);
        return null;
      }
      return token;
    } catch {
      localStorage.removeItem(StorageKey);
      return null;
    }
  }
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null): boolean {
  return !payload || typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
}
