import { Component, OnDestroy, effect, inject, input, signal, untracked } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { money, shortDate, time } from '../../core/format';
import { SalesQueriesGateway } from '../../core/gateways/sales-queries.gateway';
import { OrderInvoiceDto, OrderSearchItemDto, PagedResultDto } from '../../core/models/sales.models';
import { PdfService } from '../../core/ui/pdf.service';

type OrderSearchField = 'all' | 'invoice' | 'customercode' | 'customername';

/**
 * Angular version of NorthWind.Sales.Frontend.Views/Pages/InvoiceSearch.razor:
 * search saved orders, rebuild one of them and view, download or print its PDF.
 */
@Component({
  selector: 'app-invoices-page',
  imports: [RouterLink],
  templateUrl: './invoices-page.html',
})
export class InvoicesPage implements OnDestroy {
  private readonly gateway = inject(SalesQueriesGateway);
  private readonly pdfService = inject(PdfService);
  private readonly sanitizer = inject(DomSanitizer);
  private static readonly PageSize = 8;

  /** ?orderId=N opens that order directly (link from the create-order page). */
  readonly orderId = input<string | undefined>();

  protected readonly money = money;
  protected readonly shortDate = shortDate;
  protected readonly time = time;
  protected readonly searchText = signal('');
  protected readonly searchField = signal<OrderSearchField>('all');
  protected readonly errorMessage = signal('');
  protected readonly informationMessage = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isInvoiceLoading = signal(false);
  protected readonly isPdfLoading = signal(false);
  protected readonly result = signal<PagedResultDto<OrderSearchItemDto> | null>(null);
  protected readonly selectedInvoice = signal<OrderInvoiceDto | null>(null);
  protected readonly showInvoiceModal = signal(false);
  protected readonly showPdfViewer = signal(false);
  protected readonly pdfViewerUrl = signal<SafeResourceUrl | null>(null);

  private loadedOrderId: number | null = null;
  private pdf: { orderId: number; blob: Blob; url: string } | null = null;

  constructor() {
    this.load(1);
    effect(() => {
      const orderId = Number(this.orderId());
      if (Number.isInteger(orderId) && orderId > 0) {
        untracked(() => {
          if (this.loadedOrderId !== orderId) this.openInvoice(orderId);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.releasePdf();
  }

  protected get searchPlaceholder(): string {
    switch (this.searchField()) {
      case 'invoice': return 'Ej.: INV-000001 o 1';
      case 'customercode': return 'Ej.: ALFKI';
      case 'customername': return 'Escriba el nombre o una parte del nombre';
      default: return 'Orden, código o nombre del cliente';
    }
  }

  protected get searchHelp(): string {
    switch (this.searchField()) {
      case 'invoice': return 'Buscaremos únicamente por número de orden. Puede escribir INV-000001 o solamente 1.';
      case 'customercode': return 'Buscaremos únicamente coincidencias en el código del cliente.';
      case 'customername': return 'Puede escribir una parte del nombre; no es necesario conocerlo completo.';
      default: return 'La búsqueda flexible revisa número de orden, código y nombre del cliente.';
    }
  }

  protected get emptyMessage(): string {
    return this.searchText().trim()
      ? 'No hay resultados con ese criterio. Revise el dato o pruebe otro filtro.'
      : 'Todavía no existen órdenes registradas o no hay información para mostrar.';
  }

  protected issuedAt(invoice: OrderInvoiceDto): string {
    return `${shortDate(invoice.orderDate)} a las ${time(invoice.orderDate)}`;
  }

  protected totalUnits(invoice: OrderInvoiceDto): number {
    return invoice.details.reduce((sum, detail) => sum + detail.quantity, 0);
  }

  protected max(a: number, b: number): number {
    return Math.max(a, b);
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

  protected changeField(field: OrderSearchField): void {
    this.searchField.set(field);
    this.searchText.set('');
    this.selectedInvoice.set(null);
    this.showInvoiceModal.set(false);
    this.load(1);
  }

  protected clearText(): void {
    this.searchText.set('');
    this.load(1);
  }

  protected search(): void {
    this.load(1);
  }

  protected retry(): void {
    this.load(this.result()?.page ?? 1);
  }

  protected clearSearch(): void {
    this.searchText.set('');
    this.searchField.set('all');
    this.selectedInvoice.set(null);
    this.loadedOrderId = null;
    this.showInvoiceModal.set(false);
    this.clearMessages();
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

  protected async openInvoice(orderId: number): Promise<void> {
    try {
      this.isInvoiceLoading.set(true);
      this.clearMessages();
      const invoice = await this.gateway.getOrderInvoice(orderId);
      this.selectedInvoice.set(invoice);
      this.loadedOrderId = orderId;
      if (this.pdf?.orderId !== orderId) this.releasePdf();
      if (!invoice) {
        this.errorMessage.set('La orden seleccionada ya no se encuentra disponible. Actualice la búsqueda e intente nuevamente.');
        return;
      }
      this.showInvoiceModal.set(true);
    } catch (error) {
      this.errorMessage.set(toApiError(error).isUnauthorized
        ? 'Su sesión venció. Inicie sesión nuevamente para ver el detalle de la orden de venta.'
        : 'No pudimos abrir el detalle de esta orden de venta. Vuelva a intentarlo.');
    } finally {
      this.isInvoiceLoading.set(false);
    }
  }

  protected closeInvoiceModal(): void {
    this.showInvoiceModal.set(false);
  }

  protected async viewPdf(): Promise<void> {
    await this.withPdf(
      () => this.showPdfViewer.set(true),
      'No pudimos generar la vista previa del PDF. La orden de venta sigue guardada y puede volver a intentarlo.');
  }

  protected closePdfViewer(): void {
    this.showPdfViewer.set(false);
  }

  protected async printPdf(): Promise<void> {
    await this.withPdf((pdf) => {
      if (!this.pdfService.print(pdf.blob)) {
        this.errorMessage.set('El navegador bloqueó la ventana de impresión. Permita ventanas emergentes para este sitio e intente nuevamente.');
      }
    }, 'No pudimos abrir la impresión del PDF. Vuelva a intentarlo.');
  }

  protected async downloadPdf(): Promise<void> {
    const invoice = this.selectedInvoice();
    await this.withPdf((pdf) => {
      this.pdfService.download(pdf.blob, `${invoice?.invoiceNumber}.pdf`);
      this.informationMessage.set(`La orden de venta ${invoice?.invoiceNumber} se preparó para descarga correctamente.`);
    }, 'No pudimos descargar el PDF. La orden de venta no se ha modificado; vuelva a intentarlo.');
  }

  protected clearMessages(): void {
    this.errorMessage.set('');
    this.informationMessage.set('');
  }

  private async withPdf(action: (pdf: { blob: Blob; url: string }) => void, failure: string): Promise<void> {
    const invoice = this.selectedInvoice();
    if (!invoice) return;
    try {
      this.isPdfLoading.set(true);
      this.clearMessages();
      if (this.pdf?.orderId !== invoice.orderId) {
        this.releasePdf();
        const blob = await this.gateway.getOrderPdf(invoice.orderId);
        const url = URL.createObjectURL(blob);
        this.pdf = { orderId: invoice.orderId, blob, url };
        this.pdfViewerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }
      action(this.pdf!);
    } catch {
      this.errorMessage.set(failure);
    } finally {
      this.isPdfLoading.set(false);
    }
  }

  private releasePdf(): void {
    if (this.pdf) URL.revokeObjectURL(this.pdf.url);
    this.pdf = null;
    this.pdfViewerUrl.set(null);
    this.showPdfViewer.set(false);
  }

  private async load(page: number): Promise<void> {
    try {
      this.isLoading.set(true);
      this.clearMessages();
      this.result.set(await this.gateway.searchOrders(
        this.searchText().trim(), this.searchField(), page, InvoicesPage.PageSize));
    } catch (error) {
      const apiError = toApiError(error);
      this.errorMessage.set(
        apiError.isUnauthorized ? 'Su sesión venció. Inicie sesión nuevamente antes de consultar las órdenes de venta.'
          : apiError.isForbidden ? 'Su usuario no tiene permiso para consultar órdenes de venta.'
            : apiError.status >= 0 ? 'No fue posible comunicarnos con el servicio de ventas. Verifique que la API esté ejecutándose y vuelva a intentarlo.'
              : 'Ocurrió un problema inesperado al consultar las órdenes de venta. Puede reintentar sin perder información.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

