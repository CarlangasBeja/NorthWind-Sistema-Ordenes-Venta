import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { money } from '../../core/format';
import {
  CustomerSearchItemDto,
  ProductSearchItemDto,
  SalesConstants,
} from '../../core/models/sales.models';
import { CreateOrderViewModel } from './create-order.view-model';
import { CustomerSearchModal } from './customer-search-modal';
import { ProductSearchModal } from './product-search-modal';

/**
 * Angular version of Pages/CreateOrder.razor + Components/CreateOrderComponent.razor:
 * the point of sale (requirements: master/detail order with search windows).
 */
@Component({
  selector: 'app-create-order-page',
  imports: [FormsModule, RouterLink, CustomerSearchModal, ProductSearchModal],
  providers: [CreateOrderViewModel],
  templateUrl: './create-order-page.html',
})
export class CreateOrderPage {
  protected readonly order = inject(CreateOrderViewModel);
  private readonly router = inject(Router);

  protected readonly money = money;
  protected readonly invoiceNumber = SalesConstants.getInvoiceNumber;

  protected readonly showCustomerSearch = signal(false);
  protected readonly showProductSearch = signal(false);
  protected readonly showRemoveConfirmation = signal(false);
  protected readonly showSaveConfirmation = signal(false);
  protected readonly showCancelConfirmation = signal(false);
  protected readonly showOrderSuccess = signal(false);
  private readonly productIndexToChange = signal<number | null>(null);
  private productIndexToRemove: number | null = null;
  protected productNameToRemove = '';
  private allowNavigation = false;
  private pendingNavigation: ((leave: boolean) => void) | null = null;

  /** Products already in the order, except the line being changed. */
  protected readonly productIdsUnavailable = computed(() => {
    const changing = this.productIndexToChange();
    return this.order.orderDetails()
      .filter((_, index) => index !== changing)
      .map((detail) => detail.productId);
  });

  /** Feedback banner (the "toast" of the Blazor component). */
  protected readonly feedback = computed(() => {
    if (this.showOrderSuccess()) return null;
    const error = this.order.errorMessage();
    const warning = this.order.warningMessage();
    const information = this.order.informationMessage();
    if (error) return { type: 'danger', title: 'No pudimos completar la operación', message: error, icon: '×' };
    if (warning) return { type: 'warning', title: 'Revise esta información', message: warning, icon: '!' };
    if (information) return { type: 'success', title: 'Operación realizada correctamente', message: information, icon: '✓' };
    return null;
  });

  get shouldWarnBeforeLeaving(): boolean {
    return this.order.hasDraftData && !this.order.hasSavedOrder() && !this.allowNavigation;
  }

  /** Browser close/reload with unsaved data (ConfirmExternalNavigation). */
  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.shouldWarnBeforeLeaving) {
      event.preventDefault();
    }
  }

  /** Used by unsavedOrderGuard: asks before leaving the page (NavigationLock). */
  confirmLeave(): Promise<boolean> {
    if (!this.shouldWarnBeforeLeaving) return Promise.resolve(true);
    this.showCancelConfirmation.set(true);
    return new Promise((resolve) => (this.pendingNavigation = resolve));
  }

  protected openCustomerSearch(): void {
    this.order.clearMessages();
    this.showCustomerSearch.set(true);
  }

  protected openProductSearchForAdd(): void {
    this.order.clearMessages();
    this.productIndexToChange.set(null);
    this.showProductSearch.set(true);
  }

  protected openProductSearchForChange(index: number): void {
    this.order.clearMessages();
    this.productIndexToChange.set(index);
    this.showProductSearch.set(true);
  }

  protected customerSelected(customer: CustomerSearchItemDto): void {
    this.order.selectCustomer(customer);
  }

  protected productSelected(product: ProductSearchItemDto): void {
    const index = this.productIndexToChange();
    if (index !== null) this.order.changeProduct(index, product);
    else this.order.addProduct(product);
  }

  protected closeCustomerSearch(): void {
    this.showCustomerSearch.set(false);
  }

  protected closeProductSearch(): void {
    this.showProductSearch.set(false);
    this.productIndexToChange.set(null);
  }

  protected onQuantityInput(index: number, value: number | null): void {
    this.order.setQuantity(index, value);
  }

  protected requestRemoveProduct(index: number): void {
    const detail = this.order.orderDetails()[index];
    if (!detail) return;
    this.productIndexToRemove = index;
    this.productNameToRemove = detail.productName;
    this.showRemoveConfirmation.set(true);
  }

  protected confirmRemoveProduct(): void {
    if (this.productIndexToRemove !== null) this.order.removeProduct(this.productIndexToRemove);
    this.closeRemoveConfirmation();
  }

  protected closeRemoveConfirmation(): void {
    this.showRemoveConfirmation.set(false);
    this.productIndexToRemove = null;
    this.productNameToRemove = '';
  }

  protected requestSave(): void {
    this.order.clearMessages();
    if (!this.order.validate()) return;
    if (!this.order.canAttemptSave()) {
      this.order.setWarning('La orden todavía no está lista para guardarse. Complete los pasos indicados en el resumen.');
      return;
    }
    this.showSaveConfirmation.set(true);
  }

  protected async confirmSave(): Promise<void> {
    this.showSaveConfirmation.set(false);
    await this.order.send();
    // The confirmation only appears when the API returned a valid id.
    this.showOrderSuccess.set((this.order.lastOrderId() ?? 0) > 0);
  }

  protected closeSaveConfirmation(): void {
    this.showSaveConfirmation.set(false);
  }

  protected closeOrderSuccess(): void {
    this.showOrderSuccess.set(false);
  }

  protected viewCreatedOrder(): void {
    const orderId = this.order.lastOrderId();
    if (!orderId || orderId <= 0) return;
    this.showOrderSuccess.set(false);
    this.allowNavigation = true;
    this.router.navigate(['/invoices'], { queryParams: { orderId } });
  }

  protected startNewOrder(): void {
    this.showOrderSuccess.set(false);
    this.order.resetForNewOrder();
    this.showSaveConfirmation.set(false);
  }

  protected requestCancelOrder(): void {
    this.router.navigateByUrl('/');
  }

  protected confirmCancelOrder(): void {
    this.allowNavigation = true;
    this.showCancelConfirmation.set(false);
    this.resolvePendingNavigation(true);
  }

  protected closeCancelConfirmation(): void {
    this.showCancelConfirmation.set(false);
    this.resolvePendingNavigation(false);
  }

  private resolvePendingNavigation(leave: boolean): void {
    this.pendingNavigation?.(leave);
    this.pendingNavigation = null;
  }
}
