import { Injectable, computed, inject, signal } from '@angular/core';
import { toApiError } from '../../core/api/api-error';
import { CreateOrderGateway } from '../../core/gateways/create-order.gateway';
import {
  CreateOrderDto,
  CustomerSearchItemDto,
  ProductSearchItemDto,
  SalesConstants,
} from '../../core/models/sales.models';
import { FieldErrors, TextRules } from '../../core/validation/field-errors';

/** CreateOrderDetailViewModel */
export interface CreateOrderDetail {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  unitsInStock: number;
}

/**
 * Angular version of NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder.CreateOrderViewModel:
 * the state of the order being created, its totals and its rules.
 * One instance per page (provided by CreateOrderPage).
 */
@Injectable()
export class CreateOrderViewModel {
  private readonly gateway = inject(CreateOrderGateway);

  readonly customerId = signal('');
  readonly customerName = signal('');
  shipAddress = '';
  shipCity = '';
  shipCountry = '';
  shipPostalCode = '';
  readonly orderDetails = signal<CreateOrderDetail[]>([]);

  readonly informationMessage = signal('');
  readonly errorMessage = signal('');
  readonly warningMessage = signal('');
  readonly lastOrderId = signal<number | null>(null);
  readonly isSubmitting = signal(false);
  readonly errors = signal(new FieldErrors());

  readonly subtotal = computed(() =>
    this.orderDetails().reduce((sum, detail) => sum + subtotalOf(detail), 0));
  readonly tax = computed(() => round2(this.subtotal() * SalesConstants.TaxRate));
  readonly total = computed(() => this.subtotal() + this.tax());
  readonly totalUnits = computed(() =>
    this.orderDetails().reduce((sum, detail) => sum + (detail.quantity || 0), 0));
  readonly hasSelectedCustomer = computed(() => this.customerId().trim().length > 0);
  readonly hasProducts = computed(() => this.orderDetails().length > 0);
  readonly hasStockIssues = computed(() => this.orderDetails().some(exceedsStock));
  readonly hasSavedOrder = computed(() => this.lastOrderId() !== null);
  readonly canAttemptSave = computed(() =>
    !this.isSubmitting() && !this.hasSavedOrder() && this.hasSelectedCustomer() &&
    this.hasProducts() && !this.hasStockIssues());

  get hasDraftData(): boolean {
    return this.hasSelectedCustomer() || this.hasProducts() ||
      [this.shipAddress, this.shipCity, this.shipCountry, this.shipPostalCode]
        .some((value) => value.trim().length > 0);
  }

  subtotalOf(detail: CreateOrderDetail): number {
    return subtotalOf(detail);
  }

  exceedsStock(detail: CreateOrderDetail): boolean {
    return exceedsStock(detail);
  }

  selectCustomer(customer: CustomerSearchItemDto): void {
    this.customerId.set(customer.id);
    this.customerName.set(customer.name);
    this.clearMessages();
    this.informationMessage.set(`Cliente ${customer.name} seleccionado correctamente.`);
    this.revalidate();
  }

  addProduct(product: ProductSearchItemDto): boolean {
    this.clearMessages();
    if (this.orderDetails().some((detail) => detail.productId === product.id)) {
      this.warningMessage.set(`El producto '${product.name}' ya forma parte de la orden. Puede cambiar su cantidad desde el detalle.`);
      return false;
    }

    this.orderDetails.update((details) => [...details, detailFrom(product, 1)]);
    this.informationMessage.set(`Producto '${product.name}' agregado a la orden.`);
    if (product.unitsInStock <= 5) {
      this.warningMessage.set(`El producto '${product.name}' tiene stock bajo: quedan ${product.unitsInStock} unidad(es).`);
    }
    this.revalidate();
    return true;
  }

  changeProduct(index: number, product: ProductSearchItemDto): boolean {
    this.clearMessages();
    const details = this.orderDetails();
    if (index < 0 || index >= details.length) {
      this.errorMessage.set('No se pudo identificar el producto que desea cambiar. Actualice la página e intente nuevamente.');
      return false;
    }
    if (details.some((detail, i) => i !== index && detail.productId === product.id)) {
      this.warningMessage.set(`El producto '${product.name}' ya está incluido en otra línea de la orden.`);
      return false;
    }

    // The quantity is kept, as in CreateOrderDetailViewModel.SetProduct.
    this.orderDetails.update((list) =>
      list.map((detail, i) => (i === index ? detailFrom(product, detail.quantity > 0 ? detail.quantity : 1) : detail)));
    this.informationMessage.set(`Producto actualizado a '${product.name}'.`);
    this.revalidate();
    return true;
  }

  removeProduct(index: number): void {
    this.clearMessages();
    const detail = this.orderDetails()[index];
    if (detail) {
      this.orderDetails.update((list) => list.filter((_, i) => i !== index));
      this.informationMessage.set(`Producto '${detail.productName}' eliminado de la orden.`);
      this.revalidate();
    }
  }

  increaseQuantity(index: number): void {
    this.clearMessages();
    const detail = this.orderDetails()[index];
    if (!detail) return;
    if (detail.quantity >= detail.unitsInStock) {
      this.warningMessage.set(`No puede agregar más unidades de '${detail.productName}'. El stock disponible es ${detail.unitsInStock}.`);
      return;
    }
    this.setQuantity(index, detail.quantity + 1);
  }

  decreaseQuantity(index: number): void {
    this.clearMessages();
    const detail = this.orderDetails()[index];
    if (!detail) return;
    if (detail.quantity <= 1) {
      this.warningMessage.set('La cantidad mínima permitida es 1. Si ya no necesita el producto, utilice el botón Eliminar.');
      return;
    }
    this.setQuantity(index, detail.quantity - 1);
  }

  setQuantity(index: number, value: number | null): void {
    const quantity = Number.isFinite(value) ? Math.trunc(value as number) : 0;
    this.orderDetails.update((list) =>
      list.map((detail, i) => (i === index ? { ...detail, quantity } : detail)));
    this.revalidate();
  }

  setWarning(message: string): void {
    this.clearMessages();
    this.warningMessage.set(message);
  }

  /** Client-side check before the confirmation window (EditForm OnValidSubmit). */
  validate(): boolean {
    this.validated = true;
    const errors = this.validationErrors();
    this.errors.set(errors);
    return errors.isEmpty;
  }

  /** Called while the user edits, once the form was validated (like EditContext). */
  revalidate(): void {
    if (this.validated) {
      this.errors.set(this.validationErrors());
    }
  }

  async send(): Promise<void> {
    if (this.isSubmitting() || this.hasSavedOrder()) return;

    this.clearMessages();
    this.lastOrderId.set(null);
    const details = this.orderDetails();

    if (details.length === 0) {
      this.errorMessage.set('Agregue al menos un producto antes de guardar la orden.');
      return;
    }
    if (details.some((detail) => detail.quantity <= 0)) {
      this.errorMessage.set('Todas las cantidades deben ser mayores que cero. Revise el detalle de productos.');
      return;
    }
    if (details.some((detail) => detail.quantity > detail.unitsInStock)) {
      this.errorMessage.set('Una o más cantidades superan el stock disponible. Revise los productos resaltados antes de continuar.');
      return;
    }

    try {
      this.isSubmitting.set(true);
      const orderId = await this.gateway.createOrder(this.toDto());
      this.lastOrderId.set(orderId);
      this.informationMessage.set(
        `La orden ${SalesConstants.getInvoiceNumber(orderId)} se guardó correctamente. El inventario fue actualizado y la orden de venta generada ya está disponible.`);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.hasValidationErrors) {
        this.errors.set(FieldErrors.from(apiError.errors));
        this.errorMessage.set('Encontramos información que necesita corrección. Revise los campos marcados y vuelva a intentarlo.');
      } else {
        this.errorMessage.set(friendlyError(apiError.status, apiError.message));
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  resetForNewOrder(): void {
    this.customerId.set('');
    this.customerName.set('');
    this.shipAddress = '';
    this.shipCity = '';
    this.shipCountry = '';
    this.shipPostalCode = '';
    this.orderDetails.set([]);
    this.lastOrderId.set(null);
    this.clearMessages();
    this.validated = false;
    this.errors.set(new FieldErrors());
  }

  clearMessages(): void {
    this.informationMessage.set('');
    this.errorMessage.set('');
    this.warningMessage.set('');
  }

  private validated = false;

  /** explicit operator CreateOrderDto */
  private toDto(): CreateOrderDto {
    return {
      customerId: this.customerId(),
      shipAddress: this.shipAddress.trim(),
      shipCity: this.shipCity.trim(),
      shipCountry: this.shipCountry.trim(),
      shipPostalCode: this.shipPostalCode.trim() || null,
      orderDetails: this.orderDetails().map((detail) => ({
        productId: detail.productId,
        unitPrice: detail.unitPrice,
        quantity: detail.quantity,
      })),
    };
  }

  // CreateOrderDtoValidator + CreateOrderDetailDtoValidator (layer 1), same messages.
  private validationErrors(): FieldErrors {
    const errors = new FieldErrors();
    const customerId = this.customerId().trim();
    if (!customerId) errors.add('CustomerId', 'Seleccione un cliente antes de continuar.');
    else if (customerId.length !== 5) errors.add('CustomerId', 'El código del cliente debe tener exactamente 5 caracteres.');

    const address = this.shipAddress.trim();
    if (!address) errors.add('ShipAddress', 'Ingrese la dirección de entrega.');
    else if (address.length > 60) errors.add('ShipAddress', 'La dirección de entrega no puede superar 60 caracteres.');

    this.validateText(errors, 'ShipCity', this.shipCity, 'la ciudad', 'Ingrese la ciudad de entrega.');
    this.validateText(errors, 'ShipCountry', this.shipCountry, 'el país', 'Ingrese el país de entrega.');

    if (this.shipPostalCode.trim().length > 10) {
      errors.add('ShipPostalCode', 'El código postal no puede superar 10 caracteres.');
    }

    const details = this.orderDetails();
    if (details.length === 0) errors.add('OrderDetails', 'Agregue al menos un producto antes de guardar la orden.');
    details.forEach((detail, index) => {
      if (detail.quantity <= 0) errors.add(`OrderDetails[${index}].Quantity`, 'La cantidad debe ser mayor que cero.');
    });
    return errors;
  }

  private validateText(errors: FieldErrors, field: string, value: string, label: string, required: string): void {
    const text = value.trim();
    const name = label === 'el país' ? 'El país' : 'La ciudad';
    if (!text) errors.add(field, required);
    else if (text.length < 3) errors.add(field, `${name} debe tener al menos 3 caracteres.`);
    else if (text.length > 15) errors.add(field, `${name} no puede superar 15 caracteres.`);
    else if (!TextRules.isTextValue(text)) errors.add(field, `${name} solo puede contener letras, espacios, guiones y puntos.`);
  }
}

function detailFrom(product: ProductSearchItemDto, quantity: number): CreateOrderDetail {
  return {
    productId: product.id,
    productName: product.name,
    unitPrice: product.unitPrice,
    unitsInStock: product.unitsInStock,
    quantity,
  };
}

function subtotalOf(detail: CreateOrderDetail): number {
  return detail.unitPrice * (detail.quantity || 0);
}

function exceedsStock(detail: CreateOrderDetail): boolean {
  return detail.quantity <= 0 || detail.quantity > detail.unitsInStock;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function friendlyError(status: number, message: string): string {
  if (status === 401) return 'Su sesión venció o dejó de ser válida. Inicie sesión nuevamente antes de guardar la orden.';
  if (status === 403) return 'Su usuario no tiene permiso para guardar órdenes de venta.';
  if (/stock/i.test(message)) return 'El stock cambió mientras se procesaba la venta. Revise nuevamente las cantidades disponibles antes de guardar.';
  if (/saldo|balance/i.test(message)) return 'El cliente seleccionado tiene un saldo pendiente y no puede registrar una nueva compra.';
  if (/cliente/i.test(message) && /no existe/i.test(message)) return 'El cliente seleccionado ya no está disponible. Busque y seleccione nuevamente el cliente.';
  if (/producto/i.test(message) && /no existe/i.test(message)) return 'Uno de los productos ya no está disponible. Quite ese producto y vuelva a seleccionarlo desde el catálogo.';
  return 'No pudimos comunicarnos correctamente con el servicio de ventas. Sus datos no se han perdido; espere unos segundos y vuelva a intentarlo.';
}
