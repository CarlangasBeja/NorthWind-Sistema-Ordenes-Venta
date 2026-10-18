import { HttpErrorResponse } from '@angular/common/http';
import { ValidationError } from '../models/sales.models';

/**
 * Angular version of NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler:
 * turns a ProblemDetails response of the Web API into the status, a message
 * and the validation errors per field.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: ValidationError[] = [],
  ) {
    super(message);
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** The API could not be reached (stopped, wrong address or certificate). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get hasValidationErrors(): boolean {
    return this.errors.length > 0;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    const body = parseBody(error.error);
    const errors = readValidationErrors(body);
    const message =
      (errors.length > 0 ? errors.map((e) => e.message).join('\n') : undefined) ??
      readString(body, 'detail') ??
      readString(body, 'message') ??
      (error.status === 0
        ? 'No se pudo conectar con la Web API.'
        : `No se pudo completar la solicitud (HTTP ${error.status}).`);
    return new ApiError(error.status, message, errors);
  }

  return new ApiError(-1, error instanceof Error ? error.message : 'Error inesperado.');
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
}

// ProblemDetails writes the extension "errors" at the root; older handlers nest it in "extensions".
function readValidationErrors(body: Record<string, unknown> | null): ValidationError[] {
  if (!body) {
    return [];
  }
  const extensions = body['extensions'] as Record<string, unknown> | undefined;
  const raw = body['errors'] ?? extensions?.['errors'];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => item as Record<string, unknown>)
    .map((item) => ({
      propertyName: String(item['propertyName'] ?? item['PropertyName'] ?? ''),
      message: String(item['message'] ?? item['Message'] ?? ''),
    }))
    .filter((item) => item.message.length > 0);
}

function readString(body: Record<string, unknown> | null, key: string): string | undefined {
  const value = body?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
