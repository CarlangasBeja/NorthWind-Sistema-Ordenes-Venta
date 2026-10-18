import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toApiError } from '../../core/api/api-error';
import { money } from '../../core/format';
import { SalesQueriesGateway } from '../../core/gateways/sales-queries.gateway';
import { CustomerSearchItemDto, PagedResultDto } from '../../core/models/sales.models';

/** Angular version of NorthWind.Sales.Frontend.Views/Pages/Customers.razor. */
@Component({
  selector: 'app-customers-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './customers-page.html',
})
export class CustomersPage implements OnInit {
  private readonly gateway = inject(SalesQueriesGateway);
  private static readonly PageSize = 10;

  protected readonly money = money;
  protected searchField = 'all';
  protected searchText = '';
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly busy = signal(false);
  protected readonly saving = signal(false);
  protected readonly showCreateModal = signal(false);
  protected readonly showEditModal = signal(false);
  protected readonly modalError = signal('');
  protected readonly result = signal<PagedResultDto<CustomerSearchItemDto> | null>(null);

  protected newCode = '';
  protected newName = '';
  protected newBalance: number | null = 0;
  protected editCode = '';
  protected editName = '';
  protected editBalance: number | null = 0;

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

  protected openCreateModal(): void {
    if (this.saving()) return;
    this.showEditModal.set(false);
    this.showCreateModal.set(true);
    this.newCode = '';
    this.newName = '';
    this.newBalance = 0;
    this.modalError.set('');
    this.errorMessage.set('');
  }

  protected cancelCreate(): void {
    if (this.saving()) return;
    this.showCreateModal.set(false);
    this.modalError.set('');
  }

  protected beginEdit(customer: CustomerSearchItemDto): void {
    if (this.saving()) return;
    this.showCreateModal.set(false);
    this.showEditModal.set(true);
    this.editCode = customer.id;
    this.editName = customer.name;
    this.editBalance = customer.currentBalance;
    this.modalError.set('');
    this.errorMessage.set('');
  }

  protected cancelEdit(): void {
    if (this.saving()) return;
    this.showEditModal.set(false);
    this.editCode = '';
    this.editName = '';
    this.modalError.set('');
  }

  protected async saveBalance(): Promise<void> {
    if (this.saving() || !this.showEditModal()) return;
    const balance = Number(this.editBalance ?? 0);
    if (!Number.isFinite(balance) || balance < 0 || balance > 999999.99) {
      this.modalError.set('La deuda debe estar entre $0,00 y $999.999,99.');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');
    try {
      const result = await this.gateway.updateCustomerBalance(this.editCode, balance);
      if (!result.success) {
        this.modalError.set(result.message);
        return;
      }
      this.successMessage.set(result.message);
      this.showEditModal.set(false);
      this.editCode = '';
      this.editName = '';
      await this.load(this.result()?.page ?? 1);
    } catch (error) {
      this.modalError.set(errorText(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async saveCustomer(): Promise<void> {
    if (this.saving() || !this.showCreateModal()) return;
    const id = (this.newCode ?? '').trim().toUpperCase();
    const name = (this.newName ?? '').trim();
    const balance = Number(this.newBalance ?? 0);
    if (id.length !== 5 || !/^[\p{L}\p{N}]+$/u.test(id) || name.length < 3 || name.length > 60 ||
        !Number.isFinite(balance) || balance < 0 || balance > 999999.99) {
      this.modalError.set('Ingrese un código único de 5 letras o números, un nombre de 3 a 60 caracteres y una deuda válida.');
      return;
    }

    this.saving.set(true);
    this.modalError.set('');
    try {
      const result = await this.gateway.createCustomer({ id, name, currentBalance: balance });
      if (!result.success) {
        this.modalError.set(result.message);
        return;
      }
      this.successMessage.set(result.message);
      this.showCreateModal.set(false);
      this.newCode = '';
      this.newName = '';
      this.newBalance = 0;
      this.searchText = id;
      this.searchField = 'code';
      await this.load(1);
    } catch (error) {
      this.modalError.set(errorText(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected max(a: number, b: number): number {
    return Math.max(a, b);
  }

  private async load(page: number): Promise<void> {
    this.busy.set(true);
    this.errorMessage.set('');
    try {
      this.result.set(await this.gateway.searchCustomers(
        this.searchText.trim(), this.searchField, page, CustomersPage.PageSize));
    } catch (error) {
      this.errorMessage.set(errorText(error));
    } finally {
      this.busy.set(false);
    }
  }
}

function errorText(error: unknown): string {
  const apiError = toApiError(error);
  return apiError.isUnauthorized ? 'Inicie sesión nuevamente para gestionar clientes.' : apiError.message;
}
