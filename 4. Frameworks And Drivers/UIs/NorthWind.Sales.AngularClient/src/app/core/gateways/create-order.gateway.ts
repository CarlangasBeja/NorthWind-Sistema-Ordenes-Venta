import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../api/api-error';
import { AppSettingsService } from '../config/app-settings.service';
import { CreateOrderDto, Endpoints } from '../models/sales.models';

/** Angular version of NorthWind.Sales.Frontend.WebApiGateways.CreateOrderGateway. */
@Injectable({ providedIn: 'root' })
export class CreateOrderGateway {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(AppSettingsService);

  /** Returns the id of the new order. */
  async createOrder(order: CreateOrderDto): Promise<number> {
    try {
      return await firstValueFrom(
        this.http.post<number>(this.settings.url(Endpoints.CreateOrder), order));
    } catch (error) {
      throw toApiError(error);
    }
  }
}
