import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { toApiError } from '../../core/api/api-error';
import { money } from '../../core/format';
import { SalesQueriesGateway } from '../../core/gateways/sales-queries.gateway';
import { PagedResultDto, ProductSearchItemDto } from '../../core/models/sales.models';

type ProductSearchField = 'id' | 'name' | 'all';

/** Angular version of NorthWind.Sales.Frontend.Views/Components/ProductSearchModal.razor. */
@Component({
  selector: 'app-product-search-modal',
  templateUrl: './product-search-modal.html',
})
export class ProductSearchModal {
  private readonly gateway = inject(SalesQueriesGateway);
  private static readonly PageSize = 5;

  readonly isOpen = input(false);
  /** Products already in the order (they cannot be selected twice). */
  readonly excludedProductIds = input<readonly number[]>([]);
  readonly selected = output<ProductSearchItemDto>();
  readonly closed = output<void>();

  protected readonly money = money;
  protected readonly searchText = signal('');
  protected readonly searchField = signal<ProductSearchField>('id');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly result = signal<PagedResultDto<ProductSearchItemDto> | null>(null);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        untracked(() => {
          this.searchText.set('');
          this.searchField.set('id');
          this.load(1);
        });
      }
    });
  }

  protected get searchPlaceholder(): string {
    switch (this.searchField()) {
      case 'id': return 'Escriba el ID numérico del producto, por ejemplo 1';
      case 'name': return 'Escriba el nombre o una parte del nombre';
      default: return 'Escriba ID o nombre del producto';
    }
  }

  protected get searchHelp(): string {
    switch (this.searchField()) {
      case 'id': return 'El ID debe ser numérico. La coincidencia será exacta.';
      case 'name': return 'Puede escribir una palabra completa o una parte del nombre del producto.';
      default: return 'El sistema intentará identificar si escribió un ID o un nombre.';
    }
  }

  protected get emptyMessage(): string {
    return this.searchText().trim()
      ? 'No hay coincidencias con el filtro seleccionado. Recuerde que los productos sin stock no aparecen.'
      : 'No existen productos con stock disponible para mostrar.';
  }

  protected isExcluded(product: ProductSearchItemDto): boolean {
    return this.excludedProductIds().includes(product.id);
  }

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading()) {
      event.preventDefault();
      this.load(1);
    }
  }

  protected changeField(field: ProductSearchField): void {
    this.searchField.set(field);
    this.searchText.set('');
    this.load(1);
  }

  protected clearText(): void {
    this.searchText.set('');
    this.load(1);
  }

  protected clearSearch(): void {
    this.searchField.set('id');
    this.searchText.set('');
    this.load(1);
  }

  protected search(): void {
    this.load(1);
  }

  protected previousPage(): void {
    const result = this.result();
    if (result && result.page > 1) this.load(result.page - 1);
  }

  protected nextPage(): void {
    const result = this.result();
    if (result && result.page < result.totalPages) this.load(result.page + 1);
  }

  protected select(product: ProductSearchItemDto): void {
    if (this.isExcluded(product)) return;
    this.selected.emit(product);
    this.closed.emit();
  }

  protected close(): void {
    this.closed.emit();
  }

  protected max(a: number, b: number): number {
    return Math.max(a, b);
  }

  private async load(page: number): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.result.set(await this.gateway.searchProducts(
        this.searchText().trim(), this.searchField(), page, ProductSearchModal.PageSize));
    } catch (error) {
      const apiError = toApiError(error);
      this.errorMessage.set(
        apiError.isUnauthorized ? 'Su sesión venció. Cierre esta ventana e inicie sesión nuevamente para continuar.'
          : apiError.isForbidden ? 'Su usuario no tiene permiso para consultar productos.'
            : apiError.status >= 0 ? 'No fue posible comunicarnos con el servicio de productos. Verifique que la API esté ejecutándose y vuelva a intentarlo.'
              : 'Ocurrió un problema inesperado al consultar productos. No se realizó ningún cambio; puede volver a intentarlo.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
