import { ValidationError } from '../models/sales.models';

/**
 * Validation messages per field, the Angular counterpart of Blazor's
 * EditContext + <ValidationMessage> + <ValidationSummary>.
 * Keys are the DTO property names the Web API uses (Email, ShipCity...).
 */
export class FieldErrors {
  private readonly byField = new Map<string, string[]>();

  static from(errors: ValidationError[]): FieldErrors {
    const result = new FieldErrors();
    for (const error of errors) {
      result.add(error.propertyName, error.message);
    }
    return result;
  }

  add(field: string, message: string): void {
    const key = normalize(field);
    const messages = this.byField.get(key) ?? [];
    if (!messages.includes(message)) {
      messages.push(message);
    }
    this.byField.set(key, messages);
  }

  for(field: string): string[] {
    return this.byField.get(normalize(field)) ?? [];
  }

  has(field: string): boolean {
    return this.for(field).length > 0;
  }

  get all(): string[] {
    return [...this.byField.values()].flat();
  }

  get isEmpty(): boolean {
    return this.byField.size === 0;
  }
}

// "OrderDetails[0].Quantity" and "orderDetails[0].quantity" are the same field.
function normalize(field: string): string {
  return (field ?? '').toLowerCase();
}

export const TextRules = {
  isEmail: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  /** Letters, spaces, hyphen and dot (CreateOrderDtoValidator.IsTextValue). */
  isTextValue: (value: string) => /^[\p{L}\s.-]*$/u.test(value),
};
