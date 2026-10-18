import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../api/api-error';
import { AppSettingsService } from '../config/app-settings.service';
import {
  MembershipEndpoints,
  TokensDto,
  UserCredentialsDto,
  UserRegistrationDto,
} from '../models/sales.models';

/** Angular version of NorthWind.Membership.Frontend.RazorViews.WebApiGateways.MembershipGateway. */
@Injectable({ providedIn: 'root' })
export class MembershipGateway {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(AppSettingsService);

  async register(user: UserRegistrationDto): Promise<void> {
    try {
      await firstValueFrom(this.http.post(this.settings.url(MembershipEndpoints.Register), user));
    } catch (error) {
      throw toApiError(error);
    }
  }

  async login(credentials: UserCredentialsDto): Promise<TokensDto> {
    try {
      return await firstValueFrom(
        this.http.post<TokensDto>(this.settings.url(MembershipEndpoints.Login), credentials));
    } catch (error) {
      throw toApiError(error);
    }
  }
}
