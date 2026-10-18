import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { toApiError } from '../api/api-error';
import { AppSettingsService } from '../config/app-settings.service';
import {
  CustomerOperationResult,
  CustomerSearchItemDto,
  CustomerWriteDto,
  Endpoints,
  OrderInvoiceDto,
  OrderSearchItemDto,
  PagedResultDto,
  ProductSearchItemDto,
} from '../models/sales.models';

/** Angular version of NorthWind.Sales.Frontend.WebApiGateways.Queries.SalesQueriesGateway. */
@Injectable({ providedIn: 'root' })
export class SalesQueriesGateway {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(AppSettingsService);

  searchCustomers(search: string, field: string, page: number, pageSize: number) {
    return this.get<PagedResultDto<CustomerSearchItemDto>>(
      Endpoints.SearchCustomers, searchParams(search, field, page, pageSize));
  }

  searchProducts(search: string, field: string, page: number, pageSize: number, includeOutOfStock = false) {
    let params = searchParams(search, field, page, pageSize);
    if (includeOutOfStock) {
      params = params.set('includeOutOfStock', 'true');
    }
    return this.get<PagedResultDto<ProductSearchItemDto>>(Endpoints.SearchProducts, params);
  }

  searchOrders(search: string, field: string, page: number, pageSize: number) {
    return this.get<PagedResultDto<OrderSearchItemDto>>(
      Endpoints.SearchOrders, searchParams(search, field, page, pageSize));
  }

  /** Null when the order does not exist (404). */
  async getOrderInvoice(orderId: number): Promise<OrderInvoiceDto | null> {
    try {
      return await this.get<OrderInvoiceDto>(Endpoints.GetOrderInvoice(orderId));
    } catch (error) {
      if (toApiError(error).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getOrderPdf(orderId: number): Promise<Blob> {
    try {
      return await firstValueFrom(
        this.http.get(this.settings.url(Endpoints.GetOrderPdf(orderId)), { responseType: 'blob' }));
    } catch (error) {
      throw toApiError(error);
    }
  }

  createCustomer(customer: CustomerWriteDto) {
    return this.customerOperation(
      this.http.post<CustomerOperationResult>(this.settings.url(Endpoints.CreateCustomer), customer));
  }

  updateCustomerBalance(id: string, currentBalance: number) {
    return this.customerOperation(
      this.http.put<CustomerOperationResult>(
        this.settings.url(Endpoints.UpdateCustomerBalance(id)), { currentBalance }));
  }

  // The API answers { success, message } also when it rejects the operation (400 or 409).
  private async customerOperation(request: ReturnType<HttpClient['post']>): Promise<CustomerOperationResult> {
    try {
      return (await firstValueFrom(request)) as CustomerOperationResult;
    } catch (error) {
      const body = (error as { error?: unknown }).error as Partial<CustomerOperationResult> | undefined;
      if (body && typeof body.success === 'boolean' && typeof body.message === 'string') {
        return { success: body.success, message: body.message };
      }
      throw toApiError(error);
    }
  }

  private async get<T>(route: string, params?: HttpParams): Promise<T> {
    try {
      return await firstValueFrom(this.http.get<T>(this.settings.url(route), { params }));
    } catch (error) {
      throw toApiError(error);
    }
  }
}

function searchParams(search: string, field: string, page: number, pageSize: number): HttpParams {
  return new HttpParams()
    .set('search', search ?? '')
    .set('field', field || 'all')
    .set('page', page)
    .set('pageSize', pageSize);
}
