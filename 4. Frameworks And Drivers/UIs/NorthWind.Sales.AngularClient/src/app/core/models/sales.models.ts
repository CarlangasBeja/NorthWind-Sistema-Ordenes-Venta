/*
 * TypeScript copies of the DTOs in NorthWind.Sales.Entities and
 * NorthWind.Membership.Entities (layer 1). The Web API serializes them in camelCase.
 */

/** NorthWind.Sales.Entities.ValueObjects.Endpoints */
export const Endpoints = {
  CreateOrder: '/CreateOrder',
  SearchCustomers: '/api/customers/search',
  SearchProducts: '/api/products/search',
  CreateCustomer: '/api/customers',
  UpdateCustomerBalance: (customerId: string) =>
    `/api/customers/${encodeURIComponent(customerId)}/balance`,
  SearchOrders: '/api/orders/search',
  GetOrderInvoice: (orderId: number) => `/api/orders/${orderId}`,
  GetOrderPdf: (orderId: number) => `/api/orders/${orderId}/pdf`,
} as const;

/** NorthWind.Membership.Entities.ValueObjects.Endpoints */
export const MembershipEndpoints = {
  Register: '/user/Register',
  Login: '/user/Login',
} as const;

/** NorthWind.Sales.Entities.ValueObjects.SalesConstants */
export const SalesConstants = {
  TaxRate: 0.15,
  getInvoiceNumber: (orderId: number) => `INV-${String(orderId).padStart(6, '0')}`,
} as const;

export interface PagedResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CustomerSearchItemDto {
  id: string;
  name: string;
  currentBalance: number;
}

export interface ProductSearchItemDto {
  id: number;
  name: string;
  unitPrice: number;
  unitsInStock: number;
}

export interface OrderSearchItemDto {
  orderId: number;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderInvoiceDetailDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderInvoiceDto {
  orderId: number;
  invoiceNumber: string;
  orderDate: string;
  customerId: string;
  customerName: string;
  shipAddress: string;
  shipCity: string;
  shipCountry: string;
  shipPostalCode: string | null;
  subtotal: number;
  tax: number;
  total: number;
  details: OrderInvoiceDetailDto[];
}

export interface CreateOrderDetailDto {
  productId: number;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: string;
  shipAddress: string;
  shipCity: string;
  shipCountry: string;
  shipPostalCode: string | null;
  orderDetails: CreateOrderDetailDto[];
}

export interface CustomerWriteDto {
  id: string;
  name: string;
  currentBalance: number;
}

export interface CustomerOperationResult {
  success: boolean;
  message: string;
}

export interface UserCredentialsDto {
  email: string;
  password: string;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TokensDto {
  accessToken: string;
}

/** NorthWind.Validation.Entities.ValueObjects.ValidationError */
export interface ValidationError {
  propertyName: string;
  message: string;
}
