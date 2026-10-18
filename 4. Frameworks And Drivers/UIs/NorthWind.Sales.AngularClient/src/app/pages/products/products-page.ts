import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { money } from '../../core/format';
import { SalesQueriesGateway } from '../../core/gateways/sales-queries.gateway';
import { PagedResultDto, ProductSearchItemDto } from '../../core/models/sales.models';

/** Angular version of NorthWind.Sales.Frontend.Views/Pages/Products.razor (includes products out of stock). */
@Component({
  selector: 'app-products-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './products-page.html',
})
export class ProductsPage implements OnInit {
  private readonly gateway = inject(SalesQueriesGateway);
  private static readonly PageSize = 10;

  protected readonly money = money;
  protected searchField = 'all';
  protected searchText = '';
  protected readonly errorMessage = signal('');
  protected readonly busy = signal(false);
  protected readonly result = signal<PagedResultDto<ProductSearchItemDto> | null>(null);

  ngOnInit(): void {
    this.load(1);
  }

  protected search(): void {
    this.load(1);
  }

  protected clear(): void {
    this.searchText = '';
    this.searchField = 'all';
    this.load(1);
  }

  protected onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.busy()) {
      event.preventDefault();
      this.search();
    }
  }

  protected previous(): void {
    this.load(Math.max(1, (this.result()?.page ?? 1) - 1));
  }

  protected next(): void {
    this.load((this.result()?.page ?? 0) + 1);
  }

  protected max(a: number, b: number): number {
    return Math.max(a, b);
  }

  private async load(page: number): Promise<void> {
    this.busy.set(true);
    this.errorMessage.set('');
    try {
      this.result.set(await this.gateway.searchProducts(
        this.searchText.trim(), this.searchField, page, ProductsPage.PageSize, true));
    } catch (error) {
      const apiError = toApiError(error);
      this.errorMessage.set(apiError.isUnauthorized ? 'Inicie sesión para consultar productos.' : apiError.message);
    } finally {
      this.busy.set(false);
    }
  }
}
